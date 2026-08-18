const { body } = require('express-validator');
const User = require('../models/User');
const SHGProfile = require('../models/SHGProfile');
const ProductBatch = require('../models/ProductBatch');
const B2BOrder = require('../models/B2BOrder');
const { AppError } = require('../middlewares/auth');

// ─── Controllers ──────────────────────────────────────────

/**
 * @desc   Get aggregated impact analytics
 * @route  GET /api/v1/admin/analytics
 * @access Private (ngo_admin)
 */
const getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    const orderDateFilter = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

    // Run all aggregations in parallel
    const [
      totalUsers,
      totalSHGs,
      totalProducts,
      totalOrders,
      revenuePerCluster,
      ordersByMilestone,
      categoryBreakdown,
      ordersOverTime,
      topBuyers,
    ] = await Promise.all([
      // 1. User counts by role
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),

      // 2. SHG counts by verification status
      SHGProfile.aggregate([
        { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
      ]),

      // 3. Product batch count
      ProductBatch.countDocuments({ isActive: true }),

      // 4. Order summary
      B2BOrder.aggregate([
        { $match: { currentMilestone: { $ne: 'CANCELLED' }, ...orderDateFilter } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' },
          },
        },
      ]),

      // 5. Revenue per SHG cluster
      B2BOrder.aggregate([
        { $match: { currentMilestone: { $ne: 'CANCELLED' }, ...orderDateFilter } },
        {
          $lookup: {
            from: 'shgprofiles',
            localField: 'shgProfileId',
            foreignField: '_id',
            as: 'shg',
          },
        },
        { $unwind: '$shg' },
        {
          $group: {
            _id: { shgId: '$shgProfileId', clusterName: '$shg.clusterName', district: '$shg.district' },
            revenue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
            memberCount: { $first: '$shg.memberCount' },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 20 },
        {
          $project: {
            _id: 0,
            shgId: '$_id.shgId',
            clusterName: '$_id.clusterName',
            district: '$_id.district',
            revenue: 1,
            orderCount: 1,
            memberCount: 1,
          },
        },
      ]),

      // 6. Orders by current milestone
      B2BOrder.aggregate([
        { $group: { _id: '$currentMilestone', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // 7. Category breakdown of product batches
      ProductBatch.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$currentStock' } } },
        { $sort: { count: -1 } },
      ]),

      // 8. Orders over time (monthly)
      B2BOrder.aggregate([
        { $match: { currentMilestone: { $ne: 'CANCELLED' } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            orders: { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
        {
          $project: {
            _id: 0,
            month: {
              $concat: [
                { $toString: '$_id.year' }, '-',
                { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] },
              ],
            },
            orders: 1,
            revenue: 1,
          },
        },
      ]),

      // 9. Top buyers
      B2BOrder.aggregate([
        { $match: { currentMilestone: { $ne: 'CANCELLED' } } },
        { $group: { _id: '$buyerId', totalSpent: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'buyer',
            pipeline: [{ $project: { name: 1, email: 1, organization: 1 } }],
          },
        },
        { $unwind: '$buyer' },
        { $project: { _id: 0, totalSpent: 1, orders: 1, buyer: 1 } },
      ]),
    ]);

    // ─── Compute Livelihoods Supported ──────────────────────
    const approvedSHGs = await SHGProfile.aggregate([
      { $match: { verificationStatus: 'approved' } },
      { $group: { _id: null, totalMembers: { $sum: '$memberCount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          users: totalUsers,
          shgs: totalSHGs,
          activeProducts: totalProducts,
          orders: totalOrders[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 },
          livelihoodsSupported: approvedSHGs[0]?.totalMembers || 0,
        },
        charts: {
          revenuePerCluster,
          ordersByMilestone,
          categoryBreakdown,
          ordersOverTime,
          topBuyers,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Verify or reject an SHG profile
 * @route  PATCH /api/v1/admin/shg/:id/verify
 * @access Private (ngo_admin)
 */
const verifySHG = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return next(new AppError("Status must be 'approved' or 'rejected'.", 400));
    }

    const profile = await SHGProfile.findById(req.params.id);
    if (!profile) {
      return next(new AppError('SHG Profile not found.', 404));
    }

    const updates = {
      verificationStatus: status,
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
    };

    if (status === 'rejected') {
      if (!rejectionReason) {
        return next(new AppError('Rejection reason is required when rejecting an SHG.', 400));
      }
      updates.rejectionReason = rejectionReason;
    }

    const updated = await SHGProfile.findByIdAndUpdate(req.params.id, updates, { new: true });

    // Also verify the user account
    if (status === 'approved') {
      await User.findByIdAndUpdate(profile.userId, { isVerified: true });
    }

    res.status(200).json({
      success: true,
      message: `SHG Profile ${status} successfully.`,
      data: { profile: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Authorize escrow release for an order
 * @route  PATCH /api/v1/admin/orders/:id/escrow
 * @access Private (ngo_admin)
 */
const authorizeEscrow = async (req, res, next) => {
  try {
    const order = await B2BOrder.findById(req.params.id);
    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    if (order.currentMilestone !== 'DELIVERED') {
      return next(
        new AppError(
          'Escrow can only be released after order is marked as DELIVERED.',
          400
        )
      );
    }

    if (order.escrowStatus === 'released') {
      return next(new AppError('Escrow has already been released for this order.', 400));
    }

    const updated = await B2BOrder.findByIdAndUpdate(
      req.params.id,
      {
        escrowStatus: 'released',
        escrowAuthorizedBy: req.user._id,
        escrowAuthorizedAt: new Date(),
        currentMilestone: 'FUNDS_RELEASED',
        $push: {
          milestoneHistory: {
            stage: 'FUNDS_RELEASED',
            updatedBy: req.user._id,
            note: req.body.note || 'Escrow released by NGO admin',
          },
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Escrow released and funds disbursed to SHG.',
      data: { order: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get all users (admin)
 * @route  GET /api/v1/admin/users
 * @access Private (ngo_admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics, verifySHG, authorizeEscrow, getAllUsers };
