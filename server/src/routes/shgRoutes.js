const express = require('express');
const router = express.Router();
const {
  getNearbySHGs,
  createProfile,
  getProfile,
  getMyProfile,
  updateProfile,
  getAllSHGs,
} = require('../controllers/shgController');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createProfileSchema,
  updateProfileSchema,
  nearbyQuerySchema,
} = require('../schemas/shgSchema');

// Public / Buyer routes
router.get(
  '/nearby',
  protect,
  authorize('b2b_buyer', 'ngo_admin'),
  validate({ query: nearbyQuerySchema }),
  getNearbySHGs
);

// SHG profile routes
router.get('/profile/me', protect, authorize('shg_leader'), getMyProfile);
router.get('/profile/:id', protect, getProfile);
router.post(
  '/profile',
  protect,
  authorize('shg_leader'),
  validate(createProfileSchema),
  createProfile
);
router.put(
  '/profile/:id',
  protect,
  authorize('shg_leader', 'ngo_admin'),
  validate(updateProfileSchema),
  updateProfile
);

// Admin: list all SHGs
router.get('/', protect, authorize('ngo_admin'), getAllSHGs);

module.exports = router;
