
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const experienceItemSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  duration: { type: String, required: true },
  bullets: [{ type: String }]
}, { _id: false });

const educationItemSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, default: '' },
  graduationYear: { type: String, default: '' },
  gpa: { type: String, default: '' }
}, { _id: false });

const projectItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  bullets: [{ type: String }],
  techStack: [{ type: String }],
  link: { type: String, default: '' }
}, { _id: false });

const certificationItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, default: '' },
  year: { type: String, default: '' },
  status: { type: String, default: '' }
}, { _id: false });

const achievementItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' }
}, { _id: false });

const activityItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  role: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false });

const skillCategorySchema = new mongoose.Schema({
  category: { type: String, default: '' },
  items: [{ type: String }]
}, { _id: false });

const versionSchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  generatedAt: { type: Date, default: Date.now },
  content: {
    summary: { type: String, default: '' },
    education: [educationItemSchema],
    experience: [experienceItemSchema],
    projects: [projectItemSchema],
    certifications: [certificationItemSchema],
    achievements: [achievementItemSchema],
    activities: [activityItemSchema],
    skills: [{ type: String }],
    skillCategories: [skillCategorySchema],
    codingProfile: { type: mongoose.Schema.Types.Mixed, default: null }
  },
  atsScore: { type: Number, min: 0, max: 100, default: 0 },
  pdfUrl: { type: String, default: '' }
}, { _id: true });

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  profileType: {
    type: String,
    enum: ['fresher', 'experienced'],
    default: 'fresher'
  },
  jobTitle: {
    type: String,
    default: 'Untitled Position'
  },
  companyName: {
    type: String,
    default: ''
  },
  jobDescriptionText: {
    type: String,
    default: ''
  },
  personalInfo: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  originalExperience: [{
    company: String,
    role: String,
    duration: String,
    bullets: [String]
  }],
  originalEducation: [{
    institution: String,
    degree: String,
    field: String,
    graduationYear: String,
    gpa: String
  }],
  originalProjects: [{
    title: String,
    description: String,
    bullets: [String],
    techStack: [String],
    link: String
  }],
  originalCertifications: [{
    name: String,
    issuer: String,
    year: String,
    status: String
  }],
  originalAchievements: [{
    title: String,
    description: String
  }],
  originalActivities: [{
    title: String,
    role: String,
    description: String
  }],
  originalSkills: [{ type: String }],
  atsScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  matchedKeywords: [{ type: String }],
  missingKeywords: [{ type: String }],
  suggestions: [{ type: String }],
  isPublic: {
    type: Boolean,
    default: false
  },
  publicSlug: {
    type: String,
    unique: true,
    sparse: true,
    default: () => uuidv4().replace(/-/g, '').slice(0, 16)
  },
  versions: [versionSchema]
}, {
  timestamps: true
});


resumeSchema.methods.getLatestVersion = function() {
  if (this.versions.length === 0) return null;
  return this.versions[this.versions.length - 1];
};


resumeSchema.methods.getNextVersionNumber = function() {
  if (this.versions.length === 0) return 1;
  return Math.max(...this.versions.map(v => v.versionNumber)) + 1;
};

module.exports = mongoose.model('Resume', resumeSchema);
