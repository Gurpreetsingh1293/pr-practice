const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  verifySHG,
  authorizeEscrow,
  getAllUsers,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

// All admin routes require ngo_admin role
router.use(protect, authorize('ngo_admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.patch('/shg/:id/verify', verifySHG);
router.patch('/orders/:id/escrow', authorizeEscrow);

module.exports = router;
