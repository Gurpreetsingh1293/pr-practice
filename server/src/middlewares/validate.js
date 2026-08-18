const { ZodError } = require('zod');

/**
 * validate middleware using Zod
 * 
 * Supports passing:
 * 1. A Zod Schema directly -> parses req.body by default
 * 2. An object { body?: Schema, query?: Schema, params?: Schema } -> parses respective parts of request
 *
 * @param {import('zod').ZodSchema | { body?: import('zod').ZodSchema, query?: import('zod').ZodSchema, params?: import('zod').ZodSchema }} schema
 */
const validate = (schema) => async (req, res, next) => {
  try {
    if (schema.body || schema.query || schema.params) {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
    } else {
      req.body = await schema.parseAsync(req.body);
    }
    next();
  } catch (error) {
    if (error instanceof ZodError || error.name === 'ZodError') {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};

module.exports = validate;
