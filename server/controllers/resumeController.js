const { validationResult } = require('express-validator');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { generateResume } = require('../utils/aiHelper');
const { generatePDF } = require('../utils/pdfHelper');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const generate = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const {
      jobTitle, jobDescriptionText, experience, education,
      projects, certifications, achievements, activities, skills
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user || (user.apiCredits ?? 50) <= 0) {
      return res.status(402).json({
        success: false,
        message: 'API Token limit reached. Please wait for a refill or contact support.'
      });
    }

    const success = await generateResume({
      jobTitle: jobTitle || '',
      jobDescriptionText,
      experience: experience || [],
      education: education || [],
      projects: projects || [],
      certifications: certifications || [],
      achievements: achievements || [],
      activities: activities || [],
      skills: skills || [],
    }, res, req.user.id);

    if (success) {
      // Atomic credit deduction: prevents race condition under concurrent requests
      await User.findOneAndUpdate(
        { _id: req.user.id, apiCredits: { $gt: 0 } },
        { $inc: { apiCredits: -1 } }
      );
    }
  } catch (error) {
    next(error);
  }
};

const listResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .select('-versions')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: resumes,
      message: `Found ${resumes.length} resume(s)`
    });
  } catch (error) {
    next(error);
  }
};

const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

const createResume = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const resume = await Resume.create({
      userId: req.user.id,
      profileType: req.body.profileType || 'fresher',
      jobTitle: req.body.jobTitle || 'Untitled Position',
      companyName: req.body.companyName || '',
      personalInfo: req.body.personalInfo || {},
      originalExperience: req.body.originalExperience || [],
      originalEducation: req.body.originalEducation || [],
      originalProjects: req.body.originalProjects || [],
      originalCertifications: req.body.originalCertifications || [],
      originalAchievements: req.body.originalAchievements || [],
      originalActivities: req.body.originalActivities || [],
    });

    res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const toggleVisibility = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    resume.isPublic = !resume.isPublic;
    await resume.save();

    res.json({
      success: true,
      message: `Resume is now ${resume.isPublic ? 'public' : 'private'}`,
      data: {
        isPublic: resume.isPublic,
        publicSlug: resume.isPublic ? resume.publicSlug : null
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPublicResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      publicSlug: req.params.slug,
      isPublic: true
    }).select('jobTitle companyName personalInfo versions publicSlug profileType');

    if (!resume) {
      return next(new AppError('Resume not found or not public', 404));
    }

    const latestVersion = resume.versions.length > 0
      ? resume.versions[resume.versions.length - 1]
      : null;

    res.json({
      success: true,
      data: {
        jobTitle: resume.jobTitle,
        companyName: resume.companyName,
        personalInfo: resume.personalInfo,
        profileType: resume.profileType,
        version: latestVersion
      }
    });
  } catch (error) {
    next(error);
  }
};

const saveVersion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    const { content, atsScore, jobDescriptionText, personalInfo, originalExperience, jobTitle, companyName } = req.body;

    // Enforce maximum versions limit to prevent unbounded document growth
    const MAX_VERSIONS = 20;
    if (resume.versions.length >= MAX_VERSIONS) {
      return next(new AppError(`Maximum ${MAX_VERSIONS} versions reached. Please delete old versions first.`, 400));
    }

    const newVersion = {
      versionNumber: resume.getNextVersionNumber(),
      content: content || { summary: '', education: [], experience: [], projects: [], certifications: [], achievements: [], activities: [], skills: [], skillCategories: [], codingProfile: null },
      atsScore: atsScore || 0
    };

    resume.versions.push(newVersion);

    if (atsScore) resume.atsScore = atsScore;
    if (req.body.matchedKeywords) resume.matchedKeywords = req.body.matchedKeywords;
    if (req.body.missingKeywords) resume.missingKeywords = req.body.missingKeywords;
    if (req.body.suggestions) resume.suggestions = req.body.suggestions;
    if (jobDescriptionText !== undefined) resume.jobDescriptionText = jobDescriptionText;
    if (personalInfo !== undefined) resume.personalInfo = personalInfo;
    if (originalExperience !== undefined) resume.originalExperience = originalExperience;
    if (req.body.originalEducation !== undefined) resume.originalEducation = req.body.originalEducation;
    if (req.body.originalProjects !== undefined) resume.originalProjects = req.body.originalProjects;
    if (req.body.originalCertifications !== undefined) resume.originalCertifications = req.body.originalCertifications;
    if (req.body.originalAchievements !== undefined) resume.originalAchievements = req.body.originalAchievements;
    if (req.body.originalActivities !== undefined) resume.originalActivities = req.body.originalActivities;
    if (req.body.originalSkills !== undefined) resume.originalSkills = req.body.originalSkills;
    if (req.body.profileType !== undefined) resume.profileType = req.body.profileType;
    if (jobTitle !== undefined) resume.jobTitle = jobTitle;
    if (companyName !== undefined) resume.companyName = companyName;

    await resume.save();

    res.json({
      success: true,
      message: 'Version saved successfully',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

const exportPDF = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    let content = req.body.content;
    let personalInfo = req.body.personalInfo || resume.personalInfo;
    let jobTitle = req.body.jobTitle || resume.jobTitle;
    let versionNumber = 'current';

    if (!content) {
      const version = resume.versions.find(
        v => v.versionNumber === parseInt(req.params.versionNumber)
      );

      if (!version) {
        return next(new AppError('Version not found', 404));
      }
      content = version.content;
      personalInfo = resume.personalInfo;
      jobTitle = resume.jobTitle;
      versionNumber = `v${version.versionNumber}`;
    }

    const template = req.query.template || 'modern';

    let pdfBuffer;
    try {
      pdfBuffer = await generatePDF(personalInfo, content, template, jobTitle || '');
    } catch (pdfErr) {
      logger.error('PDF generation failed:', pdfErr.message);
      return res.status(500).json({
        success: false,
        message: 'PDF generation failed. Please try again.'
      });
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'PDF generation produced empty output.'
      });
    }

    const nameParts = (personalInfo?.name || 'resume').split(' ');
    const firstName = nameParts[0] || 'resume';
    const lastName = nameParts.slice(1).join('_') || '';
    const company = (resume.companyName || 'company').replace(/\s+/g, '_');
    const filename = `${firstName}${lastName ? '_' + lastName : ''}_${company}_${versionNumber}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

const deleteVersion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const { id, versionNumber } = req.params;
    const resume = await Resume.findOne({ _id: id, userId: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });

    const vNum = parseInt(versionNumber, 10);
    const before = resume.versions.length;
    resume.versions = resume.versions.filter(v => v.versionNumber !== vNum);

    if (resume.versions.length === before) {
      return res.status(404).json({ success: false, message: 'Version not found' });
    }

    await resume.save();
    res.json({ success: true, message: `Version ${vNum} deleted` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generate,
  listResumes,
  getResume,
  createResume,
  deleteResume,
  toggleVisibility,
  getPublicResume,
  saveVersion,
  deleteVersion,
  exportPDF
};
