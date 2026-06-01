const pdf = require('pdf-parse');
const Groq = require('groq-sdk');
const { AI_PROMPTS, AI_CONFIG } = require('../utils/constants');
const { cleanJsonResponse, getGroqUsageInfo, getClient } = require('../utils/aiHelper');
const logger = require('../utils/logger');

const analyzeResume = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (user && user.apiCredits === undefined) user.apiCredits = 50;
    if (!user || user.apiCredits <= 0) {
      return res.status(402).json({
        success: false,
        message: 'API Token limit reached. Please wait for a refill or contact support.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file'
      });
    }

    const { jobDescription } = req.body;

    if (jobDescription && jobDescription.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Job description must be at least 50 characters if provided'
      });
    }

    let resumeText;
    try {
      const pdfData = await pdf(req.file.buffer);
      resumeText = pdfData.text;

      if (!resumeText || resumeText.trim().length < 50) {
        return res.status(400).json({
          success: false,
          message: 'Could not extract enough text from the PDF. The file may be image-based or corrupted. Please upload a text-based PDF.'
        });
      }
    } catch (pdfError) {
      logger.error('PDF parsing error:', pdfError.message);
      return res.status(400).json({
        success: false,
        message: 'Failed to parse the PDF file. Please ensure it is a valid, text-based PDF.'
      });
    }

    const ai = getClient();
    const userMessage = `Resume Text (extracted from PDF):\n${resumeText}\n\n---\n\nTarget Job Description:\n${jobDescription || 'None provided. Evaluate based on general professional best practices and standard ATS rules.'}`;

    let structuredContent = null;
    try {
      const { data: contentResult } = await ai.chat.completions.create({
        messages: [
          { role: 'system', content: AI_PROMPTS.EXTRACT_RESUME_CONTENT },
          { role: 'user', content: resumeText }
        ],
        model: AI_CONFIG.MODEL,
        temperature: 0.2,
        max_tokens: 3000,
      }).withResponse();

      const contentText = contentResult.choices[0]?.message?.content || '';
      const cleanedContent = cleanJsonResponse(contentText);
      structuredContent = JSON.parse(cleanedContent);

      req._contentTokens = contentResult.usage?.total_tokens || Math.ceil((resumeText.length + contentText.length) / 3.8);
    } catch (extractError) {
      logger.warn('Resume content extraction failed:', extractError.message);
      structuredContent = {
        personalInfo: {},
        summary: '',
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        achievements: [],
        activities: [],
        skills: [],
        skillCategories: [],
        codingProfile: null,
      };
    }

    const { data: result, response: httpResponse } = await ai.chat.completions.create({
      messages: [
        { role: 'system', content: AI_PROMPTS.DEEP_ATS_AUDIT },
        { role: 'user', content: userMessage }
      ],
      model: AI_CONFIG.MODEL,
      temperature: AI_CONFIG.TEMPERATURE,
      max_tokens: AI_CONFIG.MAX_TOKENS,
    }).withResponse();

    const auditTokens = result.usage?.total_tokens || Math.ceil((userMessage.length + (result.choices[0]?.message?.content || '').length) / 3.8);

    if (httpResponse?.headers) {
      const { updateGroqUsageFromHeaders } = require('../utils/aiHelper');
      try { updateGroqUsageFromHeaders(httpResponse.headers); } catch(e) {}
    }

    const responseText = result.choices[0]?.message?.content || "";
    const cleaned = cleanJsonResponse(responseText);

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch (parseError) {
      logger.error('Failed to parse ATS audit response:', parseError.message);
      logger.error('Raw response:', cleaned.slice(0, 500));

      return res.status(500).json({
        success: false,
        message: 'AI returned an invalid response. No credit was deducted — please try again.'
      });
    }

    const rawScore = typeof analysis.overall_score === 'number' ? analysis.overall_score : 0;
    const hasValidSections = analysis.sections && Object.values(analysis.sections).some(
      s => s && typeof s.score === 'number' && s.score > 0
    );
    const hasKeywords = (analysis.matched_keywords?.length > 0) || (analysis.missing_keywords?.length > 0);
    const hasMeaningfulOutput = rawScore > 0 && (hasValidSections || hasKeywords);

    if (!hasMeaningfulOutput) {
      logger.warn('AI returned incomplete analysis — not deducting credit. Response:', JSON.stringify(analysis).slice(0, 500));
      return res.status(500).json({
        success: false,
        message: 'AI returned an incomplete analysis (score 0). No credit was deducted — please try again.'
      });
    }

    const normalizedAnalysis = {
      overall_score: rawScore,
      sections: {
        contact_info: normSection(analysis.sections?.contact_info),
        summary: normSection(analysis.sections?.summary),
        experience: normSection(analysis.sections?.experience),
        education: normSection(analysis.sections?.education),
        skills: normSection(analysis.sections?.skills),
        projects: normSection(analysis.sections?.projects),
        certifications: normSection(analysis.sections?.certifications),
      },
      matched_keywords: analysis.matched_keywords || [],
      missing_keywords: analysis.missing_keywords || [],
      formatting_issues: analysis.formatting_issues || [],
      line_suggestions: deduplicateSuggestions(
        (analysis.line_suggestions || []).map(s => ({
          section: s.section || 'general',
          original: s.original || '',
          improved: s.improved || '',
          reason: s.reason || '',
        }))
      ),
      verdict: analysis.verdict || 'Analysis complete.',
      resumeTextLength: resumeText.length,
    };

    const { trackTokensUsed } = require('../utils/aiHelper');
    const contentTokens = req._contentTokens || 0;
    if (contentTokens > 0) await trackTokensUsed(req.user.id, contentTokens);
    await trackTokensUsed(req.user.id, auditTokens);

    user.apiCredits -= 1;
    await user.save();

    let reportId = null;
    try {
      const AnalysisReport = require('../models/AnalysisReport');
      const pdfBase64 = req.file ? req.file.buffer.toString('base64') : null;
      const savedReport = await AnalysisReport.create({
        userId: req.user.id,
        resumeName: req.file ? req.file.originalname : 'Resume_Analysis',
        jobDescription: jobDescription || '',
        overall_score: normalizedAnalysis.overall_score,
        sections: normalizedAnalysis.sections,
        matched_keywords: normalizedAnalysis.matched_keywords,
        missing_keywords: normalizedAnalysis.missing_keywords,
        formatting_issues: normalizedAnalysis.formatting_issues,
        line_suggestions: normalizedAnalysis.line_suggestions,
        verdict: normalizedAnalysis.verdict,
        content: structuredContent,
        pdfData: pdfBase64
      });
      reportId = savedReport._id;
    } catch (saveError) {
      logger.error('Failed to auto-save analysis report:', saveError.message);
    }

    res.json({
      success: true,
      message: 'Resume analyzed successfully',
      data: {
        ...normalizedAnalysis,
        content: structuredContent,
        reportId,
        apiCredits: user.apiCredits
      }
    });

  } catch (error) {
    logger.error('analyzeResume error:', error.message);
    if (!res.headersSent) {
      const rawErrMsg = error?.error?.error?.message || error?.message || String(error) || '';
      let userMessage = 'Analysis failed. Please try again.';
      const errStr = typeof rawErrMsg === 'string' ? rawErrMsg : JSON.stringify(rawErrMsg);

      if (errStr.includes('429') || errStr.toLowerCase().includes('rate limit') || errStr.toLowerCase().includes('tokens per minute') || errStr.toLowerCase().includes('rate_limit_exceeded') || errStr.includes('413') || errStr.includes('quota') || errStr.includes('resource_exhausted') || errStr.toLowerCase().includes('daily limit') || errStr.toLowerCase().includes('too large')) {
        userMessage = 'API token limit reached.';
        const { updateGroqUsageFromError } = require('../utils/aiHelper');
        updateGroqUsageFromError(errStr);
      } else if (errStr.includes('API_KEY') || errStr.includes('apiKey')) {
        userMessage = 'AI API key is not configured. Please check server settings.';
      }
      return res.status(500).json({
        success: false,
        message: userMessage
      });
    }
    next(error);
  }
};

function deduplicateSuggestions(suggestions) {
  const seenOriginals = new Set();
  const seenReasons = new Set();
  return suggestions.filter(s => {
    const origKey = s.original.trim().toLowerCase();
    const reasonKey = s.reason.trim().toLowerCase();

    if (!s.original || s.original.trim() === s.improved.trim()) return false;
    if (seenOriginals.has(origKey)) return false;
    seenOriginals.add(origKey);

    const reasonFingerprint = reasonKey.slice(0, 30);
    if (seenReasons.has(reasonFingerprint)) return false;
    seenReasons.add(reasonFingerprint);
    return true;
  });
}

function normSection(section) {
  if (!section) {
    return {
      score: 0,
      status: 'missing',
      found: false,
      issues: ['Section not detected in resume'],
      suggestions: ['Add this section to improve ATS compatibility'],
    };
  }
  return {
    score: section.score || 0,
    status: section.status || 'needs_improvement',
    found: section.found !== false,
    issues: section.issues || [],
    suggestions: section.suggestions || [],
  };
}

const auditResumeJSON = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (user && user.apiCredits === undefined) user.apiCredits = 50;
    if (!user || user.apiCredits <= 0) {
      return res.status(402).json({
        success: false,
        message: 'API Token limit reached. Please wait for a refill or contact support.'
      });
    }
    const { resumeContent, jobDescription } = req.body;
    if (!resumeContent) {
      return res.status(400).json({
        success: false,
        message: 'resumeContent is required'
      });
    }

    if (jobDescription && jobDescription.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Job description must be at least 50 characters if provided'
      });
    }

    const ai = getClient();
    const userMessage = `Resume JSON Data:\n${JSON.stringify(resumeContent, null, 2)}\n\n---\n\nTarget Job Description:\n${jobDescription || 'None provided. Evaluate based on general professional best practices and standard ATS rules.'}`;

    const result = await ai.chat.completions.create({
      messages: [
        { role: 'system', content: AI_PROMPTS.DEEP_ATS_AUDIT_JSON },
        { role: 'user', content: userMessage }
      ],
      model: AI_CONFIG.MODEL,
      temperature: AI_CONFIG.TEMPERATURE,
      max_tokens: AI_CONFIG.MAX_TOKENS,
    });

    const auditJsonTokens = result.usage?.total_tokens || Math.ceil((userMessage.length + (result.choices[0]?.message?.content || '').length) / 3.8);

    const responseText = result.choices[0]?.message?.content || "";
    const cleaned = cleanJsonResponse(responseText);

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch (parseError) {
      logger.error('Failed to parse ATS audit JSON response:', parseError.message);

      return res.status(500).json({
        success: false,
        message: 'AI returned an invalid response. No credit was deducted — please try again.'
      });
    }

    const rawScore = typeof analysis.overall_score === 'number' ? analysis.overall_score : 0;
    const hasValidSections = analysis.sections && Object.values(analysis.sections).some(
      s => s && typeof s.score === 'number' && s.score > 0
    );
    const hasKeywords = (analysis.matched_keywords?.length > 0) || (analysis.missing_keywords?.length > 0);
    const hasMeaningfulOutput = rawScore > 0 && (hasValidSections || hasKeywords);

    if (!hasMeaningfulOutput) {
      logger.warn('AI returned incomplete audit — not deducting credit. Response:', JSON.stringify(analysis).slice(0, 500));
      return res.status(500).json({
        success: false,
        message: 'AI returned an incomplete analysis (score 0). No credit was deducted — please try again.'
      });
    }

    const normalizedAnalysis = {
      overall_score: rawScore,
      sections: {
        contact_info: normSection(analysis.sections?.contact_info),
        summary: normSection(analysis.sections?.summary),
        experience: normSection(analysis.sections?.experience),
        education: normSection(analysis.sections?.education),
        skills: normSection(analysis.sections?.skills),
        projects: normSection(analysis.sections?.projects),
        certifications: normSection(analysis.sections?.certifications),
      },
      matched_keywords: analysis.matched_keywords || [],
      missing_keywords: analysis.missing_keywords || [],
      formatting_issues: analysis.formatting_issues || [],
      line_suggestions: deduplicateSuggestions(
        (analysis.line_suggestions || []).map(s => ({
          section: s.section || 'general',
          original: s.original || '',
          improved: s.improved || '',
          reason: s.reason || '',
        }))
      ),
      verdict: analysis.verdict || 'Analysis complete.',
    };

    const { trackTokensUsed } = require('../utils/aiHelper');
    await trackTokensUsed(req.user.id, auditJsonTokens);

    user.apiCredits -= 1;
    await user.save();

    let reportId = null;
    try {
      const AnalysisReport = require('../models/AnalysisReport');
      const resumeName = (resumeContent?.personalInfo?.name ? `${resumeContent.personalInfo.name}'s Resume` : '') || resumeContent?.jobTitle || 'Resume_Analysis';
      const savedReport = await AnalysisReport.create({
        userId: req.user.id,
        resumeName,
        jobDescription: jobDescription || '',
        overall_score: normalizedAnalysis.overall_score,
        sections: normalizedAnalysis.sections,
        matched_keywords: normalizedAnalysis.matched_keywords,
        missing_keywords: normalizedAnalysis.missing_keywords,
        formatting_issues: normalizedAnalysis.formatting_issues,
        line_suggestions: normalizedAnalysis.line_suggestions,
        verdict: normalizedAnalysis.verdict,
        content: resumeContent
      });
      reportId = savedReport._id;
    } catch (saveError) {
      logger.error('Failed to auto-save JSON audit report:', saveError.message);
    }

    res.json({
      success: true,
      message: 'Resume audited successfully',
      data: {
        ...normalizedAnalysis,
        reportId,
        apiCredits: user.apiCredits
      }
    });

  } catch (error) {
    let errMsg = error?.error?.error?.message || error?.message || String(error) || 'Analysis failed. Please try again.';
    const errStr = typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg);
    
    if (errStr.includes('429') || errStr.toLowerCase().includes('rate limit') || errStr.toLowerCase().includes('tokens per minute') || errStr.toLowerCase().includes('rate_limit_exceeded') || errStr.includes('413') || errStr.toLowerCase().includes('daily limit') || errStr.toLowerCase().includes('too large')) {
      errMsg = 'API token limit reached.';
      const { updateGroqUsageFromError } = require('../utils/aiHelper');
      updateGroqUsageFromError(errStr);
    }

    logger.error('auditResumeJSON error:', errMsg);
    return res.status(500).json({
      success: false,
      message: errMsg
    });
  }
};

const listReports = async (req, res, next) => {
  try {
    const AnalysisReport = require('../models/AnalysisReport');
    const reports = await AnalysisReport.find({ userId: req.user.id })
      .select('resumeName overall_score createdAt jobDescription')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    logger.error('listReports error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analysis reports'
    });
  }
};

const getReport = async (req, res, next) => {
  try {
    const AnalysisReport = require('../models/AnalysisReport');
    const report = await AnalysisReport.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Analysis report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('getReport error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analysis report details'
    });
  }
};

const deleteReport = async (req, res, next) => {
  try {
    const AnalysisReport = require('../models/AnalysisReport');
    const result = await AnalysisReport.deleteOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Analysis report not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Analysis report deleted successfully'
    });
  } catch (error) {
    logger.error('deleteReport error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete analysis report'
    });
  }
};

module.exports = {
  analyzeResume,
  auditResumeJSON,
  listReports,
  getReport,
  deleteReport
};
