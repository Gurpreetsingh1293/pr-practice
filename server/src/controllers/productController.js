const ProductBatch = require('../models/ProductBatch');
const SHGProfile = require('../models/SHGProfile');
const { AppError } = require('../middlewares/auth');

// ─── Helpers ───────────────────────────────────────────────
const buildProductFilter = (query) => {
  const filter = { isActive: true };
  if (query.category) filter.category = query.category;
  if (query.minPrice) filter.unitPrice = { $gte: parseFloat(query.minPrice) };
  if (query.maxPrice) filter.unitPrice = { ...filter.unitPrice, $lte: parseFloat(query.maxPrice) };
  if (query.search) {
    filter.$or = [
      { productName: new RegExp(query.search, 'i') },
      { description: new RegExp(query.search, 'i') },
    ];
  }
  return filter;
};

// ─── Controllers ──────────────────────────────────────────

/**
 * @desc   Create new product batch
 * @route  POST /api/v1/products
 * @access Private (shg_leader)
 */
const createBatch = async (req, res, next) => {
  try {
    // Get this user's SHG profile
    const shgProfile = await SHGProfile.findOne({ userId: req.user._id });
    if (!shgProfile) {
      return next(new AppError('You must create an SHG profile before adding products.', 400));
    }

    if (shgProfile.verificationStatus !== 'approved') {
      return next(
        new AppError(
          'Your SHG profile must be approved by an NGO admin before adding products.',
          403
        )
      );
    }

    const batch = await ProductBatch.create({
      ...req.body,
      shgProfileId: shgProfile._id,
    });

    res.status(201).json({ success: true, data: { batch } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get all active product batches (paginated, filterable)
 * @route  GET /api/v1/products?category=&search=&page=&limit=
 * @access Public
 */
const getAllBatches = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || '-createdAt';

    const filter = buildProductFilter(req.query);

    const [batches, total] = await Promise.all([
      ProductBatch.find(filter)
        .populate({
          path: 'shgProfileId',
          select: 'groupName clusterName district state location verificationStatus rating',
          match: { verificationStatus: 'approved' },
        })
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductBatch.countDocuments(filter),
    ]);

    // Filter out batches where shgProfileId is null (not verified)
    const verified = batches.filter((b) => b.shgProfileId !== null);

    res.status(200).json({
      success: true,
      count: verified.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: verified,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single product batch
 * @route  GET /api/v1/products/:id
 * @access Public
 */
const getBatch = async (req, res, next) => {
  try {
    const batch = await ProductBatch.findById(req.params.id).populate({
      path: 'shgProfileId',
      select: 'groupName clusterName district state location memberCount rating profileImageUrl',
      populate: { path: 'userId', select: 'name phone' },
    });

    if (!batch) {
      return next(new AppError('Product batch not found.', 404));
    }

    res.status(200).json({ success: true, data: { batch } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update product batch
 * @route  PUT /api/v1/products/:id
 * @access Private (shg_leader - own products only)
 */
const updateBatch = async (req, res, next) => {
  try {
    const batch = await ProductBatch.findById(req.params.id).populate('shgProfileId');
    if (!batch) {
      return next(new AppError('Product batch not found.', 404));
    }

    // Ownership check
    if (batch.shgProfileId.userId.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only update your own product batches.', 403));
    }

    const updated = await ProductBatch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: { batch: updated } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Deactivate (soft-delete) product batch
 * @route  DELETE /api/v1/products/:id
 * @access Private (shg_leader - own products only, ngo_admin)
 */
const deleteBatch = async (req, res, next) => {
  try {
    const batch = await ProductBatch.findById(req.params.id).populate('shgProfileId');
    if (!batch) {
      return next(new AppError('Product batch not found.', 404));
    }

    // Ownership check for shg_leader
    if (
      req.user.role === 'shg_leader' &&
      batch.shgProfileId.userId.toString() !== req.user._id.toString()
    ) {
      return next(new AppError('You can only delete your own product batches.', 403));
    }

    await ProductBatch.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({ success: true, message: 'Product batch deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get products for current SHG leader's profile
 * @route  GET /api/v1/products/my
 * @access Private (shg_leader)
 */
const getMyBatches = async (req, res, next) => {
  try {
    const shgProfile = await SHGProfile.findOne({ userId: req.user._id });
    if (!shgProfile) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const batches = await ProductBatch.find({ shgProfileId: shgProfile._id }).sort('-createdAt');
    res.status(200).json({ success: true, count: batches.length, data: batches });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBatch,
  getAllBatches,
  getBatch,
  updateBatch,
  deleteBatch,
  getMyBatches,
};
