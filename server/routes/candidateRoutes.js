const express = require('express');
const router = express.Router();
const { apply, getCandidates, getCandidateById, updateCandidate, deleteCandidate, exportCSV, exportExcel } = require('../controllers/candidateController');
const { protect } = require('../middleware/authMiddleware');

router.post('/apply', apply);
router.get('/', protect, getCandidates);
router.get('/export', protect, exportCSV);
router.get('/export-excel', protect, exportExcel);
router.get('/:id', protect, getCandidateById);
router.patch('/:id', protect, updateCandidate);
router.delete('/:id', protect, deleteCandidate);

module.exports = router;
