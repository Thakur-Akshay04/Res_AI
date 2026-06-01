const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { analyzeLimiter } = require('../middleware/rateLimiter');
const { mongoIdValidator } = require('../validators/resumeValidator');
const uploadResume = require('../middleware/multerConfig');
const {
  analyzeResume,
  auditResumeJSON,
  listReports,
  getReport,
  deleteReport
} = require('../controllers/analyzeController');

router.use(protect);

router.post('/resume/analyze', analyzeLimiter, uploadResume, analyzeResume);
router.post('/resume/audit', analyzeLimiter, auditResumeJSON);

router.get('/analysis-reports', listReports);
router.get('/analysis-reports/:id', mongoIdValidator, getReport);
router.delete('/analysis-reports/:id', mongoIdValidator, deleteReport);

module.exports = router;
