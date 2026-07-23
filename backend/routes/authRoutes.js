const express = require('express');
const router = express.Router();

const { register, login, logout, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working!' });
});

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;