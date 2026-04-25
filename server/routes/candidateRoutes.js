const express = require('express');
const router = express.Router();
const { 
  apply, 
  getCandidates, 
  getCandidateById, 
  updateCandidate, 
  deleteCandidate, 
  exportCSV, 
  exportExcel,
  phase2Verify,
  phase2Submit,
  updateCandidateStatus,
  testEmail
} = require('../controllers/candidateController');
const { protect, protectCandidate } = require('../middleware/authMiddleware');

router.post('/apply', apply);
router.post('/phase2-verify', protectCandidate, phase2Verify);
router.post('/phase2-submit', protectCandidate, phase2Submit);
router.get('/test-email', testEmail);

router.get('/', protect, getCandidates);
router.get('/export', protect, exportCSV);
router.get('/export-excel', protect, exportExcel);
router.get('/:id', protect, getCandidateById);
router.patch('/:id', protect, updateCandidate);
router.put('/:id/status', protect, updateCandidateStatus);
router.delete('/:id', protect, deleteCandidate);

module.exports = router;
