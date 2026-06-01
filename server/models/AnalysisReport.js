
const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  score: { type: Number, default: 0 },
  status: { type: String, default: 'needs_improvement' },
  found: { type: Boolean, default: true },
  issues: [{ type: String }],
  suggestions: [{ type: String }]
}, { _id: false });

const lineSuggestionSchema = new mongoose.Schema({
  section: { type: String, default: 'general' },
  original: { type: String, default: '' },
  improved: { type: String, default: '' },
  reason: { type: String, default: '' }
}, { _id: false });

const analysisReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resumeName: {
    type: String,
    default: 'Resume_Analysis'
  },
  jobDescription: {
    type: String,
    default: ''
  },
  overall_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  sections: {
    contact_info: sectionSchema,
    summary: sectionSchema,
    experience: sectionSchema,
    education: sectionSchema,
    skills: sectionSchema,
    projects: sectionSchema,
    certifications: sectionSchema
  },
  matched_keywords: [{ type: String }],
  missing_keywords: [{ type: String }],
  formatting_issues: [{ type: String }],
  line_suggestions: [lineSuggestionSchema],
  verdict: {
    type: String,
    default: ''
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  pdfData: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AnalysisReport', analysisReportSchema);
