const mongoose = require('mongoose');

const productBatchSchema = new mongoose.Schema(
  {
    shgProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SHGProfile',
      required: [true, 'SHG Profile reference is required'],
    },
    // ─── Categorisation ────────────────────────────────────
    category: {
      type: String,
      enum: {
        values: ['Handicrafts', 'Organic Produce', 'Processed Food', 'Textiles', 'Other'],
        message: 'Invalid product category',
      },
      required: [true, 'Category is required'],
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    // ─── Pricing & Inventory ───────────────────────────────
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0.01, 'Unit price must be greater than 0'],
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      enum: ['kg', 'gram', 'litre', 'ml', 'piece', 'dozen', 'meter', 'bundle', 'box', 'bag'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    // ─── Order Constraints ─────────────────────────────────
    moq: {
      type: Number,
      required: [true, 'Minimum order quantity is required'],
      min: [1, 'MOQ must be at least 1'],
    },
    currentStock: {
      type: Number,
      required: [true, 'Current stock is required'],
      min: [0, 'Stock cannot be negative'],
    },
    productionCapacity: {
      type: Number,
      required: [true, 'Production capacity per month is required'],
      min: [0, 'Production capacity cannot be negative'],
    },
    leadTimeDays: {
      type: Number,
      required: [true, 'Lead time in days is required'],
      min: [1, 'Lead time must be at least 1 day'],
    },
    // ─── Quality & Certification ───────────────────────────
    certifications: [
      {
        type: String,
        enum: ['FSSAI', 'Organic', 'GI Tag', 'ISO', 'Handloom Mark', 'None'],
      },
    ],
    qualityGrade: {
      type: String,
      enum: ['A', 'B', 'C', 'Premium'],
    },
    // ─── Media ─────────────────────────────────────────────
    images: [
      {
        url: String,
        altText: String,
      },
    ],
    // ─── Status ────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    totalOrdersReceived: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────
productBatchSchema.index({ shgProfileId: 1 });
productBatchSchema.index({ category: 1 });
productBatchSchema.index({ isActive: 1 });
productBatchSchema.index({ unitPrice: 1 });
productBatchSchema.index({ category: 1, isActive: 1 });

const ProductBatch = mongoose.model('ProductBatch', productBatchSchema);
module.exports = ProductBatch;
