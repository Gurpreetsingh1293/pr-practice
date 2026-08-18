const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  verifySHG,
  authorizeEscrow,
  getAllUsers,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  verifySHGSchema,
  authorizeEscrowSchema,
  analyticsQuerySchema,
} = require('../schemas/adminSchema');

// All admin routes require ngo_admin role
router.use(protect, authorize('ngo_admin'));

router.get('/analytics', validate({ query: analyticsQuerySchema }), getAnalytics);
router.get('/users', getAllUsers);
router.patch('/shg/:id/verify', validate(verifySHGSchema), verifySHG);
router.patch('/orders/:id/escrow', validate(authorizeEscrowSchema), authorizeEscrow);

module.exports = router;
