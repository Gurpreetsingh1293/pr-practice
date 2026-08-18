const { z } = require('zod');

const MILESTONE_STAGES = [
  'PLACED',
  'RAW_MATERIAL',
  'IN_PRODUCTION',
  'PACKED',
  'DISPATCHED',
  'DELIVERED',
  'FUNDS_RELEASED',
  'CANCELLED',
];

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const deliveryAddressSchema = z.object({
  street: z.string().optional(),
  city: z
    .string({ required_error: 'Delivery city is required' })
    .trim()
    .min(1, 'Delivery city cannot be empty'),
  state: z
    .string({ required_error: 'Delivery state is required' })
    .trim()
    .min(1, 'Delivery state cannot be empty'),
  pincode: z
    .string({ required_error: 'Delivery pincode is required' })
    .regex(/^\d{6}$/, 'Please provide a valid 6-digit pincode'),
  country: z.string().default('India'),
});

const createOrderSchema = z.object({
  productBatchId: z
    .string({ required_error: 'Product batch ID is required' })
    .regex(mongoIdRegex, 'Invalid Product Batch ID format'),
  quantity: z.coerce
    .number({ required_error: 'Order quantity is required' })
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1'),
  deliveryAddress: deliveryAddressSchema,
  isRFQ: z.boolean().optional().default(false),
  rfqNote: z.string().max(1000, 'RFQ note cannot exceed 1000 characters').optional(),
});

const updateMilestoneSchema = z.object({
  nextStage: z.enum(MILESTONE_STAGES, {
    errorMap: () => ({ message: `nextStage must be one of: ${MILESTONE_STAGES.join(', ')}` }),
  }),
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
  inspectionPassed: z.boolean().optional(),
  attachmentUrl: z.string().url('Invalid attachment URL').optional().or(z.literal('')),
});

const orderQuerySchema = z.object({
  milestone: z.enum(MILESTONE_STAGES).optional(),
  escrowStatus: z.enum(['held', 'released', 'refunded', 'pending']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = {
  createOrderSchema,
  updateMilestoneSchema,
  orderQuerySchema,
};
