const { z } = require('zod');

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  role: z.enum(['shg_leader', 'b2b_buyer', 'ngo_admin'], {
    errorMap: () => ({ message: 'Role must be shg_leader, b2b_buyer, or ngo_admin' }),
  }),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number')
    .optional()
    .or(z.literal('')),
  organization: z.string().max(200, 'Organization name cannot exceed 200 characters').optional(),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

const updateMeSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number')
    .optional()
    .or(z.literal('')),
  organization: z.string().max(200).optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateMeSchema,
};
