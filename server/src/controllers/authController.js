const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const { AppError } = require('../middlewares/auth');

// ─── JWT Token Factory ─────────────────────────────────────
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * sendTokenCookie — Signs JWT and sets httpOnly cookie + response body
 */
const sendTokenCookie = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Cannot be accessed via JS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    path: '/',
  };

  res.cookie('graminlink_token', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: { user },
  });
};

// ─── Validation Chains ────────────────────────────────────
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
  body('role')
    .isIn(['shg_leader', 'b2b_buyer', 'ngo_admin'])
    .withMessage('Role must be shg_leader, b2b_buyer, or ngo_admin'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Controllers ──────────────────────────────────────────

/**
 * @desc   Register new user
 * @route  POST /api/v1/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, organization } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      organization,
    });

    sendTokenCookie(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Login user
 * @route  POST /api/v1/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password))) {
      return next(new AppError('Invalid email or password.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    sendTokenCookie(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Logout user (clear cookie)
 * @route  POST /api/v1/auth/logout
 * @access Private
 */
const logout = (req, res) => {
  res.cookie('graminlink_token', 'logged_out', {
    expires: new Date(Date.now() + 1000), // expire in 1 second
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  });

  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

/**
 * @desc   Get current logged-in user
 * @route  GET /api/v1/auth/me
 * @access Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('shgProfile');
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update current user profile (name, phone, organization)
 * @route  PUT /api/v1/auth/me
 * @access Private
 */
const updateMe = async (req, res, next) => {
  try {
    const { password, role, ...allowedFields } = req.body; // Prevent password/role via this route

    const user = await User.findByIdAndUpdate(req.user._id, allowedFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateMe,
  registerValidation,
  loginValidation,
};
