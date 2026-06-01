const Groq = require('groq-sdk');
const { AI_PROMPTS, AI_CONFIG } = require('./constants');
const logger = require('./logger');

const getClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }
  return new Groq({ apiKey });
};

const groqUsageCache = {
  resetAt: null,
  dailyResetAt: null,
  lastUpdated: null,
  model: null,
};

const parseDurationToMs = (durationStr) => {
  if (!durationStr || typeof durationStr !== 'string') return null;
  let totalMs = 0;
  const hours = durationStr.match(/(\d+(?:\.\d+)?)h/);
  const minutes = durationStr.match(/(\d+(?:\.\d+)?)m(?!s)/);
  const seconds = durationStr.match(/(\d+(?:\.\d+)?)s/);
  const millis = durationStr.match(/(\d+(?:\.\d+)?)ms/);
  if (hours) totalMs += parseFloat(hours[1]) * 3600000;
  if (minutes) totalMs += parseFloat(minutes[1]) * 60000;
  if (seconds) totalMs += parseFloat(seconds[1]) * 1000;
  if (millis) totalMs += parseFloat(millis[1]);
  return totalMs > 0 ? totalMs : null;
};

const getNextMidnightUTC = () => {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0
  ));
  return tomorrow.toISOString();
};

const updateGroqUsageFromHeaders = (headers) => {
  try {
    if (!headers || typeof headers.get !== 'function') return;

    const remaining = headers.get('x-ratelimit-remaining-tokens');
    const limit = headers.get('x-ratelimit-limit-tokens');
    const dailyRemaining = headers.get('x-ratelimit-remaining-tokens-per-day');
    const dailyLimit = headers.get('x-ratelimit-limit-tokens-per-day');
    const resetAt = headers.get('x-ratelimit-reset-tokens');

    if (remaining !== null) groqUsageCache.tokensRemaining = parseInt(remaining, 10);
    if (limit !== null) groqUsageCache.tokensLimit = parseInt(limit, 10);
    if (dailyRemaining !== null) groqUsageCache.dailyRemaining = parseInt(dailyRemaining, 10);
    if (dailyLimit !== null) groqUsageCache.dailyLimit = parseInt(dailyLimit, 10);
    if (resetAt !== null) groqUsageCache.resetAt = resetAt;

    groqUsageCache.dailyResetAt = getNextMidnightUTC();
    groqUsageCache.model = AI_CONFIG.MODEL;
    groqUsageCache.lastUpdated = new Date().toISOString();
  } catch (e) {}
};

const updateGroqUsageFromError = (errorMessage) => {
  try {
    const usedMatch = errorMessage?.match(/Used\s+([\d,]+)/i);
    const limitMatch = errorMessage?.match(/Limit\s+([\d,]+)/i);
    if (usedMatch && limitMatch) {
      const used = parseInt(usedMatch[1].replace(/,/g, ''), 10);
      const limit = parseInt(limitMatch[1].replace(/,/g, ''), 10);
      groqUsageCache.dailyLimit = limit;
      groqUsageCache.dailyRemaining = 0;
      groqUsageCache.tokensRemaining = 0;
    }

    const resetMatch = errorMessage?.match(/try again in\s+([^\.\n]+)/i);
    if (resetMatch) {
      groqUsageCache.resetAt = resetMatch[1].trim();
      const ms = parseDurationToMs(resetMatch[1].trim());
      if (ms) {
        groqUsageCache.dailyResetAt = new Date(Date.now() + ms).toISOString();
      }
    }

    if (!groqUsageCache.dailyResetAt) {
      groqUsageCache.dailyResetAt = getNextMidnightUTC();
    }
    groqUsageCache.model = AI_CONFIG.MODEL;
    groqUsageCache.lastUpdated = new Date().toISOString();
  } catch (e) {}
};

const getGroqUsageInfo = () => ({ ...groqUsageCache });

const fetchActualUsageFromGroq = async () => {
  try {
    const ai = getClient();
    const { response } = await ai.chat.completions.create({
      messages: [{ role: 'user', content: 'h' }],
      model: AI_CONFIG.MODEL,
      max_tokens: 1
    }).withResponse();
    updateGroqUsageFromHeaders(response.headers);
    logger.info("Successfully fetched live Groq usage from dummy call");
  } catch (error) {
    logger.error("Error fetching live Groq usage:", error.message);
    updateGroqUsageFromError(error.message);
  }
};

const cleanJsonResponse = (text) => {
  let cleaned = text.trim();

  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
  cleaned = cleaned.replace(/\n?```\s*$/i, '').trim();

  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    const jsonStart = cleaned.search(/[{[]/);
    if (jsonStart !== -1) {
      cleaned = cleaned.slice(jsonStart);
    }
  }

  const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  if (lastBrace !== -1 && lastBrace < cleaned.length - 1) {
    cleaned = cleaned.slice(0, lastBrace + 1);
  }

  return cleaned.trim();
};

const buildUserMessage = (data) => {
  const { jobTitle, experience, education, projects, certifications, achievements, activities, skills, jobDescriptionText } = data;

  let message = '';

  if (jobTitle) {
    message += `🚨 Target Job Title (MUST appear verbatim in summary): ${jobTitle}\n\n`;
  }

  message += `Job Description:\n${jobDescriptionText}\n\n`;

  if (education && education.length > 0) {
    message += `Education:\n${JSON.stringify(education, null, 2)}\n\n`;
  }

  if (experience && experience.length > 0) {
    message += `Work Experience:\n${JSON.stringify(experience, null, 2)}\n\n`;
  }

  if (projects && projects.length > 0) {
    message += `Projects:\n${JSON.stringify(projects, null, 2)}\n\n`;
  }

  if (certifications && certifications.length > 0) {
    message += `Certifications:\n${JSON.stringify(certifications, null, 2)}\n\n`;
  }

  if (achievements && achievements.length > 0) {
    message += `Achievements:\n${JSON.stringify(achievements, null, 2)}\n\n`;
  }

  if (activities && activities.length > 0) {
    message += `Extracurricular Activities:\n${JSON.stringify(activities, null, 2)}\n\n`;
  }

  if (skills && skills.length > 0) {
    message += `Existing Skills (include these in the skills array along with JD-extracted skills):\n${JSON.stringify(skills)}\n\n`;
  }

  if (data.jobTitle) {
    message += `\n🚨 REMINDER: The summary MUST contain the exact phrase "${data.jobTitle}". Extract ALL technical skills/tools/frameworks mentioned in the job description and include them in the skills array.\n`;
  }

  return message;
};

const generateResume = async (data, res, userId) => {
  try {
    const ai = getClient();
    const userMessage = buildUserMessage(data);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    res.write(`data: ${JSON.stringify({ type: 'progress', step: 'Analyzing job description...' })}\n\n`);

    let fullResponse = '';

    const { data: stream, response: httpResponse } = await ai.chat.completions.create({
      messages: [
        { role: 'system', content: AI_PROMPTS.GENERATE_RESUME },
        { role: 'user', content: userMessage }
      ],
      model: AI_CONFIG.MODEL,
      temperature: AI_CONFIG.TEMPERATURE,
      max_tokens: AI_CONFIG.MAX_TOKENS,
      stream: true
    }).withResponse();

    updateGroqUsageFromHeaders(httpResponse.headers);

    res.write(`data: ${JSON.stringify({ type: 'progress', step: 'Crafting your resume...' })}\n\n`);

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ type: 'token', content: text })}\n\n`);
      }
    }

    if (userId) {
      const computedTokens = Math.ceil((userMessage.length + AI_PROMPTS.GENERATE_RESUME.length + fullResponse.length) / 3.8);
      await trackTokensUsed(userId, computedTokens);
    }

    try {
      const cleaned = cleanJsonResponse(fullResponse);
      const parsed = JSON.parse(cleaned);

      res.write(`data: ${JSON.stringify({ type: 'progress', step: 'Generation complete!' })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'complete', content: parsed, groqUsage: getGroqUsageInfo() })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return true;
    } catch (parseError) {
      logger.error('Failed to parse AI response:', parseError.message);
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to parse AI response. Please try again.' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return false;
    }

  } catch (error) {
    let errMsg = error?.error?.error?.message || error?.message || 'AI service unavailable, please try again.';
    const errStr = typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg);
    
    if (errStr.includes('429') || errStr.toLowerCase().includes('rate limit') || errStr.toLowerCase().includes('tokens per minute') || errStr.toLowerCase().includes('rate_limit_exceeded') || errStr.includes('413') || errStr.toLowerCase().includes('daily limit') || errStr.toLowerCase().includes('too large')) {
      errMsg = 'API token limit reached.';
    }
    
    logger.error('generateResume error:', errMsg);
    updateGroqUsageFromError(errMsg);

    if (!res.headersSent) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
    }
    res.write(`data: ${JSON.stringify({ type: 'error', message: errMsg, groqUsage: getGroqUsageInfo() })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    return false;
  }
};

const trackTokensUsed = async (userId, tokens) => {
  if (!userId || !tokens || tokens <= 0) return;
  try {
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    const lastReset = user.lastTokenResetDate ? new Date(user.lastTokenResetDate) : new Date(0);

    const isNewDay = now.getUTCDate() !== lastReset.getUTCDate() ||
                     now.getUTCMonth() !== lastReset.getUTCMonth() ||
                     now.getUTCFullYear() !== lastReset.getUTCFullYear();

    if (isNewDay) {
      user.dailyTokensUsed = tokens;
      user.lastTokenResetDate = now;
    } else {
      user.dailyTokensUsed = (user.dailyTokensUsed || 0) + tokens;
    }

    await user.save();
    logger.info(`Tracked ${tokens} tokens for user ${userId}. Daily total used: ${user.dailyTokensUsed}`);
  } catch (error) {
    logger.error(`Error tracking tokens for user ${userId}:`, error.message);
  }
};

module.exports = { generateResume, cleanJsonResponse, getGroqUsageInfo, fetchActualUsageFromGroq, updateGroqUsageFromHeaders, updateGroqUsageFromError, getClient, trackTokensUsed, getNextMidnightUTC };
