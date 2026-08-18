const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateMilestone,
  cancelOrder,
  createOrderValidation,
  milestoneValidation,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

router.post('/', protect, authorize('b2b_buyer'), createOrderValidation, validate, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.patch('/:id/milestone', protect, milestoneValidation, validate, updateMilestone);
router.delete('/:id', protect, authorize('b2b_buyer', 'ngo_admin'), cancelOrder);

module.exports = router;
