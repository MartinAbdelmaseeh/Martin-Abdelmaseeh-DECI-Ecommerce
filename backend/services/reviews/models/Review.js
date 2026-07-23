const { mongoose } = require('../../../config/mongo');

// Deliberately does NOT import or reference the Postgres Product/User
// models — that's the whole point of keeping this service independent.
// productId/userId are just strings (the real Postgres UUIDs), unvalidated
// against Postgres itself. Trade-off: a review could technically reference
// a product ID that no longer exists (e.g. the product was later deleted).
// That's an acceptable soft edge for a review feature; if it ever matters,
// the fix is a periodic cleanup job, not tightly coupling these two DBs.
const reviewSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    // Denormalized so review lists can render a name without a Postgres
    // join — reviews stay servable even if Postgres is briefly down.
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// One review per user per product — resubmitting should edit, not duplicate.
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

reviewSchema.statics.getSummaryForProduct = async function (productId) {
  const [summary] = await this.aggregate([
    { $match: { productId } },
    { $group: { _id: null, averageRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  return {
    averageRating: summary ? Math.round(summary.averageRating * 10) / 10 : null,
    count: summary ? summary.count : 0,
  };
};

module.exports = mongoose.model('Review', reviewSchema);