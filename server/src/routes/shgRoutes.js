const express = require('express');
const router = express.Router();
const {
  getNearbySHGs,
  createProfile,
  getProfile,
  getMyProfile,
  updateProfile,
  getAllSHGs,
  createProfileValidation,
  nearbyQueryValidation,
} = require('../controllers/shgController');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

// Public / Buyer routes
router.get(
  '/nearby',
  protect,
  authorize('b2b_buyer', 'ngo_admin'),
  nearbyQueryValidation,
  validate,
  getNearbySHGs
);

// SHG profile routes
router.get('/profile/me', protect, authorize('shg_leader'), getMyProfile);
router.get('/profile/:id', protect, getProfile);
router.post('/profile', protect, authorize('shg_leader'), createProfileValidation, validate, createProfile);
router.put('/profile/:id', protect, authorize('shg_leader', 'ngo_admin'), updateProfile);

// Admin: list all SHGs
router.get('/', protect, authorize('ngo_admin'), getAllSHGs);

module.exports = router;
