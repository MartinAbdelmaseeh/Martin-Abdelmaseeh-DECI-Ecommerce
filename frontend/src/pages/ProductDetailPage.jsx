import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsApi } from '../api/products';
import { resolveImageUrl, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import ReviewsSection from '../components/ReviewsSection';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addState, setAddState] = useState('idle'); // idle | adding | added

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    productsApi
      .getById(id)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load this product.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    setAddState('adding');
    try {
      await addItem(id, quantity);
      setAddState('added');
      setTimeout(() => setAddState('idle'), 1600);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add this to your cart.');
      setAddState('idle');
    }
  }

  if (loading) return <div className="page"><LoadingSpinner label="Loading product" /></div>;
  if (error && !product) return <div className="page"><ErrorBanner message={error} /></div>;
  if (!product) return null;

  const inStock = product.stock > 0;
  const imageUrl = resolveImageUrl(product.image_url);

  return (
    <div className="page">
      <Link to="/" className="eyebrow" style={{ display: 'inline-block', marginBottom: 24 }}>
        ← Back to catalog
      </Link>

      <div className="detail-layout">
        <div className="detail-image">
          {imageUrl ? <img src={imageUrl} alt={product.title} /> : <span>No image</span>}
        </div>

        <div>
          {product.category && <span className="eyebrow">{product.category}</span>}
          <h1 className="detail-title">{product.title}</h1>
          <div className="detail-price mono">${Number(product.price).toFixed(2)}</div>

          {product.description && <p className="detail-description">{product.description}</p>}

          <table className="detail-spec-table">
            <tbody>
              <tr>
                <td>Availability</td>
                <td>
                  <span className={`badge ${inStock ? 'badge-success' : 'badge-danger'}`}>
                    {inStock ? `${product.stock} in stock` : 'out of stock'}
                  </span>
                </td>
              </tr>
              {product.category && (
                <tr>
                  <td>Category</td>
                  <td>{product.category}</td>
                </tr>
              )}
              <tr>
                <td>Product ID</td>
                <td>{product.id}</td>
              </tr>
            </tbody>
          </table>

          <ErrorBanner message={error && product ? error : ''} />

          {inStock ? (
            <div className="detail-actions">
              <div className="qty-stepper">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={addState === 'adding'}
              >
                {addState === 'added' ? 'Added ✓' : addState === 'adding' ? 'Adding…' : 'Add to cart'}
              </button>
            </div>
          ) : (
            <button className="btn btn-secondary" disabled>
              Out of stock
            </button>
          )}
        </div>
      </div>

      <ReviewsSection productId={product.id} />
    </div>
  );
}
