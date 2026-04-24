const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  birthDate: { type: String, required: true },
  studyYear: { type: String, required: true },
  departments: [{ type: String, required: true }],
  axis: { type: String, required: true },
  skills: [{ type: String, required: true }],
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  notes: { type: String, default: '' },
  score: { type: Number, default: 0, min: 0, max: 5 },
  interviewDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Candidate', candidateSchema);
