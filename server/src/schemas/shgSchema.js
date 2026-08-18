const { z } = require('zod');

const CATEGORIES = ['Handicrafts', 'Organic Produce', 'Processed Food', 'Textiles', 'Other'];

const locationSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z
    .array(z.coerce.number())
    .length(2, 'Coordinates must be an array of exactly two numbers [longitude, latitude]')
    .refine(
      ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
      'Coordinates must be valid: longitude between -180 and 180, latitude between -90 and 90'
    ),
});

const createProfileSchema = z.object({
  groupName: z
    .string({ required_error: 'SHG group name is required' })
    .trim()
    .min(1, 'Group name cannot be empty')
    .max(200, 'Group name cannot exceed 200 characters'),
  clusterName: z
    .string({ required_error: 'Cluster name is required' })
    .trim()
    .min(1, 'Cluster name cannot be empty'),
  village: z.string().trim().optional(),
  block: z.string().trim().optional(),
  district: z
    .string({ required_error: 'District is required' })
    .trim()
    .min(1, 'District is required'),
  state: z
    .string({ required_error: 'State is required' })
    .trim()
    .min(1, 'State is required'),
  pincode: z
    .string()
    .regex(/^\d{6}$/, 'Please provide a valid 6-digit pincode')
    .optional()
    .or(z.literal('')),
  location: locationSchema,
  memberCount: z
    .coerce
    .number({ required_error: 'Member count is required' })
    .int('Member count must be an integer')
    .min(1, 'Member count must be at least 1')
    .max(500, 'Member count cannot exceed 500'),
  primaryCategory: z.enum(CATEGORIES, {
    errorMap: () => ({ message: `Category must be one of: ${CATEGORIES.join(', ')}` }),
  }),
  bio: z.string().max(1000, 'Bio cannot exceed 1000 characters').optional(),
  profileImageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  socialLinks: z
    .object({
      whatsapp: z.string().optional(),
      website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    })
    .optional(),
});

const updateProfileSchema = createProfileSchema.partial();

const nearbyQuerySchema = z.object({
  lng: z.coerce
    .number({ required_error: 'Valid longitude is required' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  lat: z.coerce
    .number({ required_error: 'Valid latitude is required' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  radius: z.coerce
    .number()
    .min(1, 'Radius must be at least 1 km')
    .max(1000, 'Radius cannot exceed 1000 km')
    .default(100),
  category: z.enum(CATEGORIES).optional(),
});

module.exports = {
  createProfileSchema,
  updateProfileSchema,
  nearbyQuerySchema,
};
