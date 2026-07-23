const express = require('express');
const router = express.Router();

const {
  getReviewsForProduct,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

// Shared auth middleware — this is the one intentional cross-cutting
// dependency every protected route in the app already relies on. It's not
// a coupling between the reviews/statistics/email services themselves.
const { protect } = require('../../../middleware/authMiddleware');

router.get('/product/:productId', getReviewsForProduct);
router.post('/product/:productId', protect, createReview);
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;