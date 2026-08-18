const { body, query } = require('express-validator');
const SHGProfile = require('../models/SHGProfile');
const { AppError } = require('../middlewares/auth');
const { findNearbySHGs, findSHGsByDistrict } = require('../services/geoService');

// ─── Validation Chains ─────────────────────────────────────

const createProfileValidation = [
  body('groupName').trim().notEmpty().withMessage('Group name is required'),
  body('clusterName').trim().notEmpty().withMessage('Cluster name is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('memberCount')
    .isInt({ min: 1, max: 500 })
    .withMessage('Member count must be between 1 and 500'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be [longitude, latitude]'),
  body('location.coordinates.*').isFloat().withMessage('Coordinates must be valid numbers'),
];

const nearbyQueryValidation = [
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  query('radius')
    .optional()
    .isFloat({ min: 1, max: 1000 })
    .withMessage('Radius must be between 1 and 1000 km'),
];

// ─── Controllers ──────────────────────────────────────────

/**
 * @desc   Get nearby SHG clusters via geo-spatial query
 * @route  GET /api/v1/shg/nearby?lng=&lat=&radius=&category=
 * @access Private (b2b_buyer, ngo_admin)
 */
const getNearbySHGs = async (req, res, next) => {
  try {
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const radius = parseFloat(req.query.radius) || 100; // Default 100km
    const { category } = req.query;

    const filters = {};
    if (category) {
      filters.primaryCategory = category;
    }

    const shgs = await findNearbySHGs(lng, lat, radius, filters);

    res.status(200).json({
      success: true,
      count: shgs.length,
      searchParams: { lng, lat, radius, category },
      data: shgs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create SHG Profile
 * @route  POST /api/v1/shg/profile
 * @access Private (shg_leader)
 */
const createProfile = async (req, res, next) => {
  try {
    // Check if profile already exists for this user
    const existing = await SHGProfile.findOne({ userId: req.user._id });
    if (existing) {
      return next(new AppError('An SHG profile already exists for your account.', 409));
    }

    const profileData = {
      ...req.body,
      userId: req.user._id,
      location: {
        type: 'Point',
        coordinates: req.body.location.coordinates,
      },
    };

    const profile = await SHGProfile.create(profileData);

    res.status(201).json({
      success: true,
      message: 'SHG Profile created successfully. Pending verification.',
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single SHG Profile by ID
 * @route  GET /api/v1/shg/profile/:id
 * @access Private
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = await SHGProfile.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('verifiedBy', 'name email')
      .populate({ path: 'productBatches', match: { isActive: true } });

    if (!profile) {
      return next(new AppError('SHG Profile not found.', 404));
    }

    res.status(200).json({ success: true, data: { profile } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get current user's SHG Profile
 * @route  GET /api/v1/shg/profile/me
 * @access Private (shg_leader)
 */
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await SHGProfile.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone')
      .populate({ path: 'productBatches', match: { isActive: true } });

    if (!profile) {
      return next(new AppError('No SHG profile found. Please create one.', 404));
    }

    res.status(200).json({ success: true, data: { profile } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update SHG Profile
 * @route  PUT /api/v1/shg/profile/:id
 * @access Private (shg_leader, ngo_admin)
 */
const updateProfile = async (req, res, next) => {
  try {
    let profile = await SHGProfile.findById(req.params.id);

    if (!profile) {
      return next(new AppError('SHG Profile not found.', 404));
    }

    // Ownership check: shg_leader can only update their own profile
    if (
      req.user.role === 'shg_leader' &&
      profile.userId.toString() !== req.user._id.toString()
    ) {
      return next(new AppError('You can only update your own SHG profile.', 403));
    }

    // Prevent changing verification status through this route
    delete req.body.verificationStatus;
    delete req.body.verifiedBy;

    if (req.body.location?.coordinates) {
      req.body.location = {
        type: 'Point',
        coordinates: req.body.location.coordinates,
      };
    }

    profile = await SHGProfile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: { profile } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get all SHGs (paginated) — for admin
 * @route  GET /api/v1/shg
 * @access Private (ngo_admin)
 */
const getAllSHGs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { verificationStatus, district, state } = req.query;

    const filter = {};
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (district) filter.district = new RegExp(district, 'i');
    if (state) filter.state = new RegExp(state, 'i');

    const skip = (page - 1) * limit;
    const [profiles, total] = await Promise.all([
      SHGProfile.find(filter)
        .populate('userId', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      SHGProfile.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: profiles.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNearbySHGs,
  createProfile,
  getProfile,
  getMyProfile,
  updateProfile,
  getAllSHGs,
  createProfileValidation,
  nearbyQueryValidation,
};
