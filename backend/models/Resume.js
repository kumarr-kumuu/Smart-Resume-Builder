const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  role: String,
  company: String,
  startDate: String,
  endDate: String,
  description: String
});

const educationSchema = new mongoose.Schema({
  school: String,
  degree: String,
  year: String
});

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: { type: String, required: true },
  templateId: { type: String, default: 'modern-executive' },
  status: { 
    type: String, 
    enum: ['draft', 'final'], 
    default: 'draft' 
  },
  thumbnail: String,
  personalInfo: {
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    summary: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  experience: [experienceSchema],
  education: [educationSchema],
  skills: [String],
  score: {
    overall: Number,
    breakdown: {
      quality: Number,
      relevance: Number,
      skills: Number,
      clarity: Number,
      ats: Number
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp on save
resumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Resume', resumeSchema);