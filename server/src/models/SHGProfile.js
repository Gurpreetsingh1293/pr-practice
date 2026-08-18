const mongoose = require('mongoose');

const shgProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    groupName: {
      type: String,
      required: [true, 'SHG group name is required'],
      trim: true,
      maxlength: [200, 'Group name cannot exceed 200 characters'],
    },
    clusterName: {
      type: String,
      required: [true, 'Cluster name is required'],
      trim: true,
    },
    village: {
      type: String,
      trim: true,
    },
    block: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode'],
    },
    // ─── GeoJSON Point (2dsphere) ──────────────────────────
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: [true, 'Location type must be Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates [lng, lat] are required'],
        validate: {
          validator: function (coords) {
            return (
              coords.length === 2 &&
              coords[0] >= -180 && coords[0] <= 180 &&
              coords[1] >= -90 && coords[1] <= 90
            );
          },
          message: 'Coordinates must be [longitude, latitude] with valid ranges',
        },
      },
    },
    memberCount: {
      type: Number,
      required: [true, 'Member count is required'],
      min: [1, 'Member count must be at least 1'],
      max: [500, 'Member count cannot exceed 500'],
    },
    primaryCategory: {
      type: String,
      enum: ['Handicrafts', 'Organic Produce', 'Processed Food', 'Textiles', 'Other'],
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    bankAccountVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // ngo_admin
    },
    verifiedAt: Date,
    rejectionReason: String,
    profileImageUrl: String,
    socialLinks: {
      whatsapp: String,
      website: String,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── 2dsphere Index for Geospatial Queries ────────────────
shgProfileSchema.index({ location: '2dsphere' });
shgProfileSchema.index({ district: 1, state: 1 });
shgProfileSchema.index({ verificationStatus: 1 });

// ─── Virtual: Product Batches ────────────────────────────
shgProfileSchema.virtual('productBatches', {
  ref: 'ProductBatch',
  localField: '_id',
  foreignField: 'shgProfileId',
});

const SHGProfile = mongoose.model('SHGProfile', shgProfileSchema);
module.exports = SHGProfile;
