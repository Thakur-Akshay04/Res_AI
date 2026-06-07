const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { publicLimiter } = require('../middleware/rateLimiter');
const { generateValidator, createResumeValidator, saveVersionValidator, mongoIdValidator, versionExportValidator } = require('../validators/resumeValidator');
const {
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
} = require('../controllers/resumeController');

router.get('/resumes/public/:slug', publicLimiter, getPublicResume);

router.use(protect);

router.post('/resume/generate', generateValidator, generate);

router.get('/resumes', listResumes);
router.get('/resumes/:id', mongoIdValidator, getResume);
router.post('/resumes', createResumeValidator, createResume);
router.delete('/resumes/:id', mongoIdValidator, deleteResume);

router.post('/resumes/:id/version', mongoIdValidator, saveVersionValidator, saveVersion);
router.delete('/resumes/:id/version/:versionNumber', versionExportValidator, deleteVersion);

router.post('/resume/export/:id/:versionNumber', versionExportValidator, exportPDF);

router.patch('/resumes/:id/visibility', mongoIdValidator, toggleVisibility);
router.put('/resumes/:id/visibility', mongoIdValidator, toggleVisibility);

module.exports = router;
