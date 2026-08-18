const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateMe,
  registerValidation,
  loginValidation,
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;
