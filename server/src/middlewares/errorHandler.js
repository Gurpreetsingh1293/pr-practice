/**
 * Global Error Handler Middleware
 * Normalizes operational and unexpected errors into consistent JSON responses.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // ─── Mongoose CastError (invalid ObjectId) ────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}. Please provide a valid ID.`;
  }

  // ─── Mongoose Duplicate Key Error ─────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with this ${field} already exists.`;
  }

  // ─── Mongoose Validation Error ────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ─── JWT Errors ───────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please login again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired. Please login again.';
  }

  // ─── express-validator errors ─────────────────────────
  if (err.type === 'validation') {
    statusCode = 422;
    errors = err.errors;
  }

  // ─── Development: include stack trace ────────────────
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('💥 ERROR:', err);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
