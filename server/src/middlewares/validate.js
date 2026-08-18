const { validationResult } = require('express-validator');

/**
 * validate — Runs express-validator result check.
 * Wrap after any express-validator chain to auto-return 422 on failure.
 * Usage: router.post('/route', [...validationChains], validate, controller)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

module.exports = validate;
