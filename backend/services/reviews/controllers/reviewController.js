const Review = require('../models/Review');

// Public: list reviews for a product, plus the average rating and count.
const getReviewsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const [reviews, summary] = await Promise.all([
      Review.find({ productId }).sort({ createdAt: -1 }),
      Review.getSummaryForProduct(productId),
    ]);

    res.json({ reviews, ...summary });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }

    const review = await Review.create({
      productId,
      userId: req.user.id,
      userName: req.user.name || 'Anonymous',
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You already reviewed this product. Edit your existing review instead.' });
    }
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own reviews' });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
      }
      review.rating = rating;
    }
    if (comment !== undefined) review.comment = comment;

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};

module.exports = { getReviewsForProduct, createReview, updateReview, deleteReview };