import { useState, useEffect, useCallback } from 'react';
import { reviewsApi } from '../api/reviews';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StarDisplay, StarPicker } from './StarRating';
import LoadingSpinner from './LoadingSpinner';
import ErrorBanner from './ErrorBanner';

export default function ReviewsSection({ productId }) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await reviewsApi.getForProduct(productId);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setCount(data.count);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load reviews.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const myReview = isAuthenticated ? reviews.find((r) => r.userId === user.id) : null;

  async function handleDelete(reviewId) {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewsApi.remove(reviewId);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete this review.');
    }
  }

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h2 style={{ fontSize: 20 }}>Reviews</h2>
        {count > 0 && (
          <div className="reviews-summary">
            <StarDisplay rating={averageRating} size={18} />
            <span className="mono">{averageRating}</span>
            <span style={{ color: 'var(--color-text-muted)' }}>({count} review{count === 1 ? '' : 's'})</span>
          </div>
        )}
      </div>

      <ErrorBanner message={error} />

      {isAuthenticated && (
        <ReviewForm productId={productId} existingReview={myReview} onSaved={load} />
      )}

      {loading ? (
        <LoadingSpinner label="Loading reviews" />
      ) : reviews.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>No reviews yet. Be the first to leave one.</p>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-item-header">
                <span style={{ fontWeight: 600 }}>{review.userName}</span>
                <StarDisplay rating={review.rating} />
                <span className="eyebrow" style={{ marginLeft: 'auto' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && <p style={{ marginTop: 6, color: 'var(--color-text-muted)' }}>{review.comment}</p>}
              {(review.userId === user?.id || user?.role === 'admin') && (
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => handleDelete(review._id)}>
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewForm({ productId, existingReview, onSaved }) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setRating(existingReview?.rating || 0);
    setComment(existingReview?.comment || '');
  }, [existingReview]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating < 1) {
      setError('Pick a star rating first.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      if (existingReview) {
        await reviewsApi.update(existingReview._id, { rating, comment });
      } else {
        await reviewsApi.create(productId, { rating, comment });
      }
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your review.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card review-form" onSubmit={handleSubmit}>
      <span className="eyebrow">{existingReview ? 'Edit your review' : 'Leave a review'}</span>
      <div style={{ margin: '10px 0' }}>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <textarea
        rows={3}
        placeholder="Optional comment…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{
          width: '100%',
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: 10,
          color: 'var(--color-text)',
        }}
      />
      <ErrorBanner message={error} />
      <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 10 }} disabled={submitting}>
        {submitting ? 'Saving…' : existingReview ? 'Update review' : 'Submit review'}
      </button>
    </form>
  );
}
