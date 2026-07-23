const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const { protect, isAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin-only 
router.post('/', protect, isAdmin, upload.single('image'), createProduct);
router.put('/:id', protect, isAdmin, upload.single('image'), updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

module.exports = router;