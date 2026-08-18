const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── AppError helper ──────────────────────────────────────
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * protect — Verify JWT from httpOnly cookie or Authorization header.
 * Attaches req.user for downstream use.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check httpOnly cookie first
    if (req.cookies && req.cookies.graminlink_token) {
      token = req.cookies.graminlink_token;
    }
    // 2. Fallback: Bearer token in Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please login to access this resource.', 401));
    }

    // 3. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Your session has expired. Please login again.', 401));
      }
      return next(new AppError('Invalid authentication token.', 401));
    }

    // 4. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 5. Check if user is active
    if (!currentUser.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    // 6. Check if password was changed after JWT was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('Your password was recently changed. Please login again.', 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * authorize — Role-Based Access Control guard.
 * Usage: authorize('ngo_admin', 'shg_leader')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Role '${req.user.role}' is not authorized to perform this action.`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { protect, authorize, AppError };
