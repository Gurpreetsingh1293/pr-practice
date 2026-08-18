const { z } = require('zod');

const CATEGORIES = ['Handicrafts', 'Organic Produce', 'Processed Food', 'Textiles', 'Other'];
const UNITS = ['kg', 'gram', 'litre', 'ml', 'piece', 'dozen', 'meter', 'bundle', 'box', 'bag'];
const CERTIFICATIONS = ['FSSAI', 'Organic', 'GI Tag', 'ISO', 'Handloom Mark', 'None'];
const GRADES = ['A', 'B', 'C', 'Premium'];

const createBatchSchema = z.object({
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: `Category must be one of: ${CATEGORIES.join(', ')}` }),
  }),
  productName: z
    .string({ required_error: 'Product name is required' })
    .trim()
    .min(1, 'Product name cannot be empty')
    .max(200, 'Product name cannot exceed 200 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
  unitPrice: z.coerce
    .number({ required_error: 'Unit price is required' })
    .min(0.01, 'Unit price must be greater than 0'),
  unit: z.enum(UNITS, {
    errorMap: () => ({ message: `Unit must be one of: ${UNITS.join(', ')}` }),
  }),
  currency: z.string().default('INR'),
  moq: z.coerce
    .number({ required_error: 'Minimum order quantity is required' })
    .int('MOQ must be an integer')
    .min(1, 'MOQ must be at least 1'),
  currentStock: z.coerce
    .number({ required_error: 'Current stock is required' })
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
  productionCapacity: z.coerce
    .number({ required_error: 'Production capacity is required' })
    .int('Production capacity must be an integer')
    .min(0, 'Production capacity cannot be negative'),
  leadTimeDays: z.coerce
    .number({ required_error: 'Lead time in days is required' })
    .int('Lead time must be an integer')
    .min(1, 'Lead time must be at least 1 day'),
  certifications: z.array(z.enum(CERTIFICATIONS)).optional(),
  qualityGrade: z.enum(GRADES).optional(),
  images: z
    .array(
      z.object({
        url: z.string().url('Invalid image URL'),
        altText: z.string().optional(),
      })
    )
    .optional(),
});

const updateBatchSchema = createBatchSchema.partial();

const productQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
});

module.exports = {
  createBatchSchema,
  updateBatchSchema,
  productQuerySchema,
};
