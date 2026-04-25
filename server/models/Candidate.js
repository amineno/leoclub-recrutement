const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  birthDate: { type: String },
  studyYear: { type: String, required: true },
  departments: [{ type: String, required: true }],
  axis: { type: String, required: true },
  skills: [{ type: String }],
  
  // Phase 1 Status
  phase: { type: Number, enum: [1, 2], default: 1 },
  status: { 
    type: String, 
    enum: [
      'Pending Phase 1', 'Accepted Phase 1', 'Rejected Phase 1', 
      'Pending Phase 2', 'Accepted Phase 2', 'Rejected Phase 2'
    ], 
    default: 'Pending Phase 1' 
  },
  
  // Authentication (Magic Link)
  magicToken: { type: String },
  tokenExpiresAt: { type: Date },

  // Phase 2 Answers
  phase2Answers: {
    motivation: { type: String, default: '' },
    experience: { type: String, default: '' },
    personalityTeamwork: { type: String, default: '' },
    projectIdeation: { type: String, default: '' },
    expectationsSkills: { type: String, default: '' },
    behavioralThinking: { type: String, default: '' },
    situationalProblemSolving: { type: String, default: '' },
    communication: { type: String, default: '' } // conditional
  },

  // Scoring
  totalScore: { type: Number, default: 0 },
  scoreBreakdown: {
    motivation: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    personality: { type: Number, default: 0 },
    project: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    communication: { type: Number, default: 0 }
  },
  classification: { type: String, enum: ['High Potential', 'Medium', 'Low', 'None'], default: 'None' },
  evaluationSummary: { type: String, default: '' },

  notes: { type: String, default: '' },
  interviewDate: { type: Date },
  adminComment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Candidate', candidateSchema);
