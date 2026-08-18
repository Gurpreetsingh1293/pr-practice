/**
 * Database Seeder — GraminLink
 * Run: node src/utils/seed.js
 * Clears existing data and inserts sample users, SHG profiles, products, and orders.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const SHGProfile = require('../models/SHGProfile');
const ProductBatch = require('../models/ProductBatch');
const B2BOrder = require('../models/B2BOrder');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      SHGProfile.deleteMany({}),
      ProductBatch.deleteMany({}),
      B2BOrder.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ─── Create Users ─────────────────────────────────────
    const [admin, leader1, leader2, buyer1, buyer2] = await User.create([
      {
        name: 'Priya Sharma (Y4D Admin)',
        email: 'admin@y4dfoundation.org',
        password: 'Admin@1234',
        role: 'ngo_admin',
        organization: 'Y4D Foundation',
        isVerified: true,
      },
      {
        name: 'Meena Devi',
        email: 'meena@shg-lalpur.org',
        password: 'Shg@Leader1',
        role: 'shg_leader',
        phone: '9876543210',
        isVerified: true,
      },
      {
        name: 'Sunita Rani',
        email: 'sunita@shg-motipur.org',
        password: 'Shg@Leader2',
        role: 'shg_leader',
        phone: '9876543211',
        isVerified: true,
      },
      {
        name: 'Rajesh Kumar (UrbanMart)',
        email: 'rajesh@urbanmart.in',
        password: 'Buyer@1234',
        role: 'b2b_buyer',
        organization: 'UrbanMart Retail Pvt Ltd',
        isVerified: true,
      },
      {
        name: 'Anita Kapoor (GreenCart)',
        email: 'anita@greencart.com',
        password: 'Buyer@5678',
        role: 'b2b_buyer',
        organization: 'GreenCart Foods MSME',
        isVerified: true,
      },
    ]);
    console.log('👥 Created 5 users');

    // ─── Create SHG Profiles ──────────────────────────────
    const [shg1, shg2] = await SHGProfile.create([
      {
        userId: leader1._id,
        groupName: 'Lalpur Mahila Shakti SHG',
        clusterName: 'Lalpur Cluster',
        village: 'Lalpur',
        block: 'Hajipur',
        district: 'Vaishali',
        state: 'Bihar',
        pincode: '844101',
        location: { type: 'Point', coordinates: [85.2, 25.7] }, // [lng, lat]
        memberCount: 22,
        primaryCategory: 'Handicrafts',
        bio: 'We specialize in Madhubani art and handmade jute products since 2015.',
        verificationStatus: 'approved',
        verifiedBy: admin._id,
        verifiedAt: new Date(),
        bankAccountVerified: true,
        rating: { average: 4.5, count: 12 },
      },
      {
        userId: leader2._id,
        groupName: 'Motipur Organic Farmers SHG',
        clusterName: 'Motipur Cluster',
        village: 'Motipur',
        block: 'Muzaffarpur',
        district: 'Muzaffarpur',
        state: 'Bihar',
        pincode: '843111',
        location: { type: 'Point', coordinates: [85.0, 26.1] },
        memberCount: 18,
        primaryCategory: 'Organic Produce',
        bio: 'Certified organic produce farmers growing makhana, lychee, and seasonal vegetables.',
        verificationStatus: 'approved',
        verifiedBy: admin._id,
        verifiedAt: new Date(),
        bankAccountVerified: true,
        rating: { average: 4.8, count: 8 },
      },
    ]);
    console.log('🏘️  Created 2 SHG profiles');

    // ─── Create Product Batches ───────────────────────────
    const [p1, p2, p3] = await ProductBatch.create([
      {
        shgProfileId: shg1._id,
        category: 'Handicrafts',
        productName: 'Madhubani Art Paintings (A3 Size)',
        description: 'Traditional Madhubani paintings on handmade paper, natural colors only.',
        unitPrice: 350,
        unit: 'piece',
        moq: 50,
        currentStock: 200,
        productionCapacity: 500,
        leadTimeDays: 14,
        certifications: ['Handloom Mark'],
        qualityGrade: 'Premium',
        isActive: true,
      },
      {
        shgProfileId: shg1._id,
        category: 'Handicrafts',
        productName: 'Handwoven Jute Bags',
        description: 'Eco-friendly jute bags with traditional motifs, customizable.',
        unitPrice: 120,
        unit: 'piece',
        moq: 100,
        currentStock: 450,
        productionCapacity: 1000,
        leadTimeDays: 10,
        certifications: ['None'],
        qualityGrade: 'A',
        isActive: true,
      },
      {
        shgProfileId: shg2._id,
        category: 'Organic Produce',
        productName: 'Certified Organic Makhana (Fox Nuts)',
        description: 'Premium grade makhana, certified organic, naturally sun-dried.',
        unitPrice: 850,
        unit: 'kg',
        moq: 25,
        currentStock: 300,
        productionCapacity: 500,
        leadTimeDays: 7,
        certifications: ['Organic', 'FSSAI'],
        qualityGrade: 'Premium',
        isActive: true,
      },
    ]);
    console.log('📦 Created 3 product batches');

    // ─── Create Sample Orders ─────────────────────────────
    await B2BOrder.create([
      {
        buyerId: buyer1._id,
        shgProfileId: shg1._id,
        productBatchId: p1._id,
        quantity: 100,
        unitPrice: 350,
        totalAmount: 35000,
        deliveryAddress: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        currentMilestone: 'DISPATCHED',
        escrowStatus: 'held',
        milestoneHistory: [
          { stage: 'PLACED', updatedBy: buyer1._id, note: 'Order placed' },
          { stage: 'RAW_MATERIAL', updatedBy: leader1._id, note: 'Paper and colors procured' },
          { stage: 'IN_PRODUCTION', updatedBy: leader1._id, note: 'Artists have started painting' },
          { stage: 'PACKED', updatedBy: leader1._id, note: 'Quality checked and packed', inspectionPassed: true },
          { stage: 'DISPATCHED', updatedBy: leader1._id, note: 'Dispatched via BlueDart', attachmentUrl: 'https://example.com/receipt.pdf' },
        ],
        expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        trackingId: 'BD12345678IN',
      },
      {
        buyerId: buyer2._id,
        shgProfileId: shg2._id,
        productBatchId: p3._id,
        quantity: 50,
        unitPrice: 850,
        totalAmount: 42500,
        deliveryAddress: { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
        currentMilestone: 'PLACED',
        escrowStatus: 'pending',
        isRFQ: true,
        rfqNote: 'Looking for 50kg certified organic makhana monthly supply. Can we negotiate?',
        milestoneHistory: [
          { stage: 'PLACED', updatedBy: buyer2._id, note: 'RFQ submitted' },
        ],
      },
    ]);
    console.log('📋 Created 2 sample orders');

    console.log('\n✅ Seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test Credentials:');
    console.log('  NGO Admin: admin@y4dfoundation.org / Admin@1234');
    console.log('  SHG Leader 1: meena@shg-lalpur.org / Shg@Leader1');
    console.log('  SHG Leader 2: sunita@shg-motipur.org / Shg@Leader2');
    console.log('  B2B Buyer 1: rajesh@urbanmart.in / Buyer@1234');
    console.log('  B2B Buyer 2: anita@greencart.com / Buyer@5678');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
