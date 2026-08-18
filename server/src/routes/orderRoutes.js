const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateMilestone,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createOrderSchema,
  updateMilestoneSchema,
  orderQuerySchema,
} = require('../schemas/orderSchema');

router.post(
  '/',
  protect,
  authorize('b2b_buyer'),
  validate(createOrderSchema),
  createOrder
);
router.get('/', protect, validate({ query: orderQuerySchema }), getOrders);
router.get('/:id', protect, getOrder);
router.patch(
  '/:id/milestone',
  protect,
  validate(updateMilestoneSchema),
  updateMilestone
);
router.delete('/:id', protect, authorize('b2b_buyer', 'ngo_admin'), cancelOrder);

module.exports = router;
