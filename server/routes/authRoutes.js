const express = require('express');
const router = express.Router();
const { login, updateProfile, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
