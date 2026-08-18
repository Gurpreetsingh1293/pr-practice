const { z } = require('zod');

const verifySHGSchema = z
  .object({
    status: z.enum(['approved', 'rejected'], {
      errorMap: () => ({ message: "Status must be 'approved' or 'rejected'" }),
    }),
    rejectionReason: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'rejected' && (!data.rejectionReason || !data.rejectionReason.trim())) {
        return false;
      }
      return true;
    },
    {
      message: 'Rejection reason is required when rejecting an SHG',
      path: ['rejectionReason'],
    }
  );

const authorizeEscrowSchema = z.object({
  note: z.string().max(500).optional(),
});

const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  endDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
});

module.exports = {
  verifySHGSchema,
  authorizeEscrowSchema,
  analyticsQuerySchema,
};
