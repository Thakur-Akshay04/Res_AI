const { body, param } = require('express-validator');

const generateValidator = [
  body('jobDescriptionText')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 50 }).withMessage('Job description must be at least 50 characters if provided'),
  body().custom((value, { req }) => {
    const { experience, education, projects } = req.body;
    const hasExperience = experience && experience.length > 0 && experience.some(e => e.company || e.role);
    const hasEducation = education && education.length > 0 && education.some(e => e.institution || e.degree);
    const hasProjects = projects && projects.length > 0 && projects.some(p => p.title);
    
    if (!hasExperience && !hasEducation && !hasProjects) {
      throw new Error('Please add at least one of: education, experience, or project');
    }
    return true;
  })
];

const createResumeValidator = [
  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Job title cannot exceed 200 characters'),
  body('companyName')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Company name cannot exceed 200 characters')
];

const saveVersionValidator = [
  body('content')
    .optional()
    .isObject().withMessage('Content must be an object'),
  body('atsScore')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('ATS Score must be between 0 and 100'),
  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Job title cannot exceed 200 characters'),
  body('companyName')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Company name cannot exceed 200 characters')
];

const deleteVersionValidator = [
  param('versionNumber')
    .isInt({ min: 1 }).withMessage('Version number must be a positive integer')
];

const mongoIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid resume ID format')
];

const versionExportValidator = [
  param('id')
    .isMongoId().withMessage('Invalid resume ID format'),
  param('versionNumber')
    .isInt({ min: 1 }).withMessage('Version number must be a positive integer')
];

module.exports = { generateValidator, createResumeValidator, saveVersionValidator, deleteVersionValidator, mongoIdValidator, versionExportValidator };
