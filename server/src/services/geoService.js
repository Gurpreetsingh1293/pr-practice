const SHGProfile = require('../models/SHGProfile');
const ProductBatch = require('../models/ProductBatch');

/**
 * findNearbySHGs
 * Uses MongoDB $nearSphere geospatial query to find SHG clusters within radiusKm.
 * 
 * @param {number} lng - Longitude of search center
 * @param {number} lat - Latitude of search center
 * @param {number} radiusKm - Search radius in kilometers
 * @param {object} filters - Optional filters (category, verificationStatus)
 * @returns {Promise<Array>} - Array of SHG profiles with product batches
 */
const findNearbySHGs = async (lng, lat, radiusKm, filters = {}) => {
  const radiusInMeters = radiusKm * 1000;

  // ─── Build match filter ──────────────────────────────────
  const matchFilter = {
    verificationStatus: 'approved',
    ...filters,
  };

  const results = await SHGProfile.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distanceMeters',
        maxDistance: radiusInMeters,
        spherical: true,
        query: matchFilter,
      },
    },
    {
      $lookup: {
        from: 'productbatches',
        localField: '_id',
        foreignField: 'shgProfileId',
        as: 'productBatches',
        pipeline: [
          { $match: { isActive: true } },
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'leader',
        pipeline: [
          { $project: { name: 1, email: 1, phone: 1 } },
        ],
      },
    },
    { $unwind: { path: '$leader', preserveNullAndEmpty: true } },
    {
      $addFields: {
        distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] },
        activeProductCount: { $size: '$productBatches' },
      },
    },
    {
      $project: {
        groupName: 1,
        clusterName: 1,
        district: 1,
        state: 1,
        location: 1,
        memberCount: 1,
        primaryCategory: 1,
        verificationStatus: 1,
        rating: 1,
        profileImageUrl: 1,
        distanceKm: 1,
        distanceMeters: 1,
        activeProductCount: 1,
        productBatches: 1,
        leader: 1,
      },
    },
    { $sort: { distanceMeters: 1 } },
    { $limit: 50 },
  ]);

  return results;
};

/**
 * findSHGsByDistrict
 * Simple filter by district/state when no geo-coordinates are available.
 */
const findSHGsByDistrict = async (district, state, page = 1, limit = 20) => {
  const query = { verificationStatus: 'approved' };
  if (district) query.district = new RegExp(district, 'i');
  if (state) query.state = new RegExp(state, 'i');

  const skip = (page - 1) * limit;
  const [profiles, total] = await Promise.all([
    SHGProfile.find(query)
      .populate('userId', 'name phone')
      .populate({ path: 'productBatches', match: { isActive: true }, select: '-__v' })
      .skip(skip)
      .limit(limit)
      .lean(),
    SHGProfile.countDocuments(query),
  ]);

  return { profiles, total, page, totalPages: Math.ceil(total / limit) };
};

module.exports = { findNearbySHGs, findSHGsByDistrict };
