const mongoose = require('mongoose');

// ─── Milestone Stage Constants ────────────────────────────
const MILESTONE_STAGES = {
  PLACED: 'PLACED',
  RAW_MATERIAL: 'RAW_MATERIAL',
  IN_PRODUCTION: 'IN_PRODUCTION',
  PACKED: 'PACKED',
  DISPATCHED: 'DISPATCHED',
  DELIVERED: 'DELIVERED',
  FUNDS_RELEASED: 'FUNDS_RELEASED',
  CANCELLED: 'CANCELLED',
};

const STAGE_VALUES = Object.values(MILESTONE_STAGES);

// ─── Sub-schema: Milestone History Entry ─────────────────
const milestoneEntrySchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      enum: STAGE_VALUES,
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      maxlength: [500, 'Milestone note cannot exceed 500 characters'],
    },
    inspectionPassed: Boolean,
    attachmentUrl: String,
  },
  { timestamps: true, _id: true }
);

// ─── Sub-schema: Delivery Log ─────────────────────────────
const deliveryLogSchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    location: String,
    note: String,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─── Main B2BOrder Schema ─────────────────────────────────
const b2bOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer reference is required'],
    },
    shgProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SHGProfile',
      required: [true, 'SHG Profile reference is required'],
    },
    productBatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductBatch',
      required: [true, 'Product Batch reference is required'],
    },
    // ─── Order Details ────────────────────────────────────
    quantity: {
      type: Number,
      required: [true, 'Order quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price at time of order is required'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    // ─── RFQ Details ─────────────────────────────────────
    isRFQ: {
      type: Boolean,
      default: false,
    },
    rfqNote: {
      type: String,
      maxlength: [1000, 'RFQ note cannot exceed 1000 characters'],
    },
    // ─── Delivery ─────────────────────────────────────────
    deliveryAddress: {
      street: String,
      city: { type: String, required: [true, 'Delivery city is required'] },
      state: { type: String, required: [true, 'Delivery state is required'] },
      pincode: {
        type: String,
        match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode'],
      },
      country: { type: String, default: 'India' },
    },
    expectedDeliveryDate: Date,
    actualDeliveryDate: Date,
    trackingId: String,
    deliveryLogs: [deliveryLogSchema],
    // ─── Milestone State Machine ──────────────────────────
    currentMilestone: {
      type: String,
      enum: STAGE_VALUES,
      default: MILESTONE_STAGES.PLACED,
    },
    milestoneHistory: [milestoneEntrySchema],
    // ─── Escrow ───────────────────────────────────────────
    escrowStatus: {
      type: String,
      enum: ['held', 'released', 'refunded', 'pending'],
      default: 'pending',
    },
    escrowAuthorizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // ngo_admin
    },
    escrowAuthorizedAt: Date,
    // ─── Inspection ───────────────────────────────────────
    inspectionNotes: {
      type: String,
      maxlength: [2000, 'Inspection notes cannot exceed 2000 characters'],
    },
    inspectionApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // ─── Cancellation ────────────────────────────────────
    cancellationReason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────
b2bOrderSchema.index({ buyerId: 1 });
b2bOrderSchema.index({ shgProfileId: 1 });
b2bOrderSchema.index({ currentMilestone: 1 });
b2bOrderSchema.index({ escrowStatus: 1 });
b2bOrderSchema.index({ orderNumber: 1 });
b2bOrderSchema.index({ createdAt: -1 });

// ─── Pre-save: Generate Order Number ─────────────────────
b2bOrderSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  const count = await mongoose.model('B2BOrder').countDocuments();
  this.orderNumber = `GL-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  // Initialize milestone history with PLACED stage
  if (this.milestoneHistory.length === 0) {
    this.milestoneHistory.push({
      stage: MILESTONE_STAGES.PLACED,
      updatedBy: this.buyerId,
      note: 'Order placed by buyer',
    });
  }
  next();
});

// ─── Export constants for use in services ────────────────
b2bOrderSchema.statics.MILESTONE_STAGES = MILESTONE_STAGES;

const B2BOrder = mongoose.model('B2BOrder', b2bOrderSchema);
B2BOrder.MILESTONE_STAGES = MILESTONE_STAGES;
module.exports = B2BOrder;
