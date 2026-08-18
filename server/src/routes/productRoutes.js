const express = require('express');
const router = express.Router();
const {
  createBatch,
  getAllBatches,
  getBatch,
  updateBatch,
  deleteBatch,
  getMyBatches,
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createBatchSchema,
  updateBatchSchema,
  productQuerySchema,
} = require('../schemas/productSchema');

router.get('/', validate({ query: productQuerySchema }), getAllBatches); // Public
router.get('/my', protect, authorize('shg_leader'), getMyBatches);
router.get('/:id', getBatch); // Public

router.post(
  '/',
  protect,
  authorize('shg_leader'),
  validate(createBatchSchema),
  createBatch
);
router.put(
  '/:id',
  protect,
  authorize('shg_leader'),
  validate(updateBatchSchema),
  updateBatch
);
router.delete('/:id', protect, authorize('shg_leader', 'ngo_admin'), deleteBatch);

module.exports = router;
