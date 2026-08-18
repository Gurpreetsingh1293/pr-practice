const B2BOrder = require('../models/B2BOrder');
const ProductBatch = require('../models/ProductBatch');
const SHGProfile = require('../models/SHGProfile');
const { AppError } = require('../middlewares/auth');
const { canTransition, MILESTONE_STAGES } = require('../services/milestoneService');

// ─── Controllers ──────────────────────────────────────────

/**
 * @desc   Place a new B2B order or RFQ
 * @route  POST /api/v1/orders
 * @access Private (b2b_buyer)
 */
const createOrder = async (req, res, next) => {
  try {
    const { productBatchId, quantity, deliveryAddress, rfqNote, isRFQ } = req.body;

    // Fetch product batch
    const batch = await ProductBatch.findById(productBatchId).populate('shgProfileId');
    if (!batch || !batch.isActive) {
      return next(new AppError('Product batch not found or is no longer active.', 404));
    }

    // MOQ check
    if (quantity < batch.moq) {
      return next(
        new AppError(
          `Quantity ${quantity} is below the minimum order quantity of ${batch.moq} ${batch.unit}.`,
          400
        )
      );
    }

    // Stock check (for direct purchase, not RFQ)
    if (!isRFQ && quantity > batch.currentStock) {
      return next(
        new AppError(
          `Requested quantity ${quantity} exceeds current stock of ${batch.currentStock} ${batch.unit}.`,
          400
        )
      );
    }

    const totalAmount = batch.unitPrice * quantity;

    const order = await B2BOrder.create({
      buyerId: req.user._id,
      shgProfileId: batch.shgProfileId._id,
      productBatchId: batch._id,
      quantity,
      unitPrice: batch.unitPrice,
      totalAmount,
      deliveryAddress,
      rfqNote,
      isRFQ: isRFQ || false,
      escrowStatus: isRFQ ? 'pending' : 'held',
      currentMilestone: MILESTONE_STAGES.PLACED,
    });

    // Increment batch order count
    await ProductBatch.findByIdAndUpdate(productBatchId, {
      $inc: { totalOrdersReceived: 1 },
    });

    res.status(201).json({
      success: true,
      message: isRFQ ? 'RFQ submitted successfully.' : 'Order placed successfully.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get orders (scoped by role)
 * @route  GET /api/v1/orders
 * @access Private
 */
const getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { milestone, escrowStatus } = req.query;

    let filter = {};

    // Scope by role
    if (req.user.role === 'b2b_buyer') {
      filter.buyerId = req.user._id;
    } else if (req.user.role === 'shg_leader') {
      const shgProfile = await SHGProfile.findOne({ userId: req.user._id });
      if (shgProfile) filter.shgProfileId = shgProfile._id;
    }
    // ngo_admin sees all orders

    if (milestone) filter.currentMilestone = milestone;
    if (escrowStatus) filter.escrowStatus = escrowStatus;

    const [orders, total] = await Promise.all([
      B2BOrder.find(filter)
        .populate('buyerId', 'name email organization')
        .populate('shgProfileId', 'groupName district state')
        .populate('productBatchId', 'productName category unitPrice unit')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      B2BOrder.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single order detail
 * @route  GET /api/v1/orders/:id
 * @access Private
 */
const getOrder = async (req, res, next) => {
  try {
    const order = await B2BOrder.findById(req.params.id)
      .populate('buyerId', 'name email phone organization')
      .populate({
        path: 'shgProfileId',
        select: 'groupName clusterName district state location memberCount rating',
        populate: { path: 'userId', select: 'name phone' },
      })
      .populate('productBatchId')
      .populate('milestoneHistory.updatedBy', 'name role');

    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    // Access control: buyer can only see their orders, shg_leader their cluster's orders
    if (req.user.role === 'b2b_buyer' && order.buyerId._id.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied.', 403));
    }

    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Advance order milestone (state machine transition)
 * @route  PATCH /api/v1/orders/:id/milestone
 * @access Private (role-dependent per stage)
 */
const updateMilestone = async (req, res, next) => {
  try {
    const { nextStage, note, inspectionPassed, attachmentUrl } = req.body;

    const order = await B2BOrder.findById(req.params.id);
    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    const currentStage = order.currentMilestone;
    const userRole = req.user.role;

    // ─── State Machine Validation ──────────────────────────
    const { allowed, reason } = canTransition(currentStage, nextStage, userRole);
    if (!allowed) {
      return next(new AppError(reason, 400));
    }

    // ─── Persist Transition ────────────────────────────────
    const milestoneEntry = {
      stage: nextStage,
      updatedBy: req.user._id,
      note,
      inspectionPassed,
      attachmentUrl,
    };

    const updates = {
      currentMilestone: nextStage,
      $push: { milestoneHistory: milestoneEntry },
    };

    // Auto-update escrow when funds released
    if (nextStage === MILESTONE_STAGES.FUNDS_RELEASED) {
      updates.escrowStatus = 'released';
      updates.escrowAuthorizedBy = req.user._id;
      updates.escrowAuthorizedAt = new Date();
    }

    // Set actual delivery date
    if (nextStage === MILESTONE_STAGES.DELIVERED) {
      updates.actualDeliveryDate = new Date();
    }

    // Handle cancellation
    if (nextStage === MILESTONE_STAGES.CANCELLED) {
      updates.cancellationReason = note;
      updates.cancelledBy = req.user._id;
      updates.cancelledAt = new Date();
      if (order.escrowStatus === 'held') {
        updates.escrowStatus = 'refunded';
      }
    }

    const updated = await B2BOrder.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('buyerId', 'name email')
      .populate('shgProfileId', 'groupName district')
      .populate('milestoneHistory.updatedBy', 'name role');

    res.status(200).json({
      success: true,
      message: `Order milestone updated to '${nextStage}'.`,
      data: { order: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Cancel an order
 * @route  DELETE /api/v1/orders/:id
 * @access Private (b2b_buyer - own orders at PLACED stage, ngo_admin)
 */
const cancelOrder = async (req, res, next) => {
  try {
    const order = await B2BOrder.findById(req.params.id);
    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    if (
      req.user.role === 'b2b_buyer' &&
      order.buyerId.toString() !== req.user._id.toString()
    ) {
      return next(new AppError('Access denied.', 403));
    }

    // Use state machine for cancellation
    req.body.nextStage = MILESTONE_STAGES.CANCELLED;
    req.body.note = req.body.reason || 'Order cancelled';
    return updateMilestone(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateMilestone,
  cancelOrder,
};
