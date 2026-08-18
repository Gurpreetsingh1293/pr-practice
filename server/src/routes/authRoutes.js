const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateMe,
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  registerSchema,
  loginSchema,
  updateMeSchema,
} = require('../schemas/authSchema');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/me', protect, validate(updateMeSchema), updateMe);

module.exports = router;
