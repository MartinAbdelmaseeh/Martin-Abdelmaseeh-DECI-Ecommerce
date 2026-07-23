import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../api/orders';
import { resolveImageUrl, ApiError } from '../api/client';
import ErrorBanner from '../components/ErrorBanner';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CartPage() {
  const { items, loading, subtotal, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  async function handlePlaceOrder() {
    setError('');
    setPlacingOrder(true);
    try {
      const { order } = await ordersApi.create();
      navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not place your order.');
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loading) return <div className="page"><LoadingSpinner label="Loading your cart" /></div>;

  return (
    <div className="page">
      <span className="eyebrow">Your cart</span>
      <h1 style={{ marginBottom: 24 }}>Cart</h1>

      <ErrorBanner message={error} />

      {items.length === 0 ? (
        <div className="empty-state card">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
            Browse the catalog
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="card">
            {items.map((item) => (
              <CartLine key={item.item_id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
            ))}
          </div>

          <div className="card cart-summary">
            <h3 style={{ marginBottom: 16 }}>Order summary</h3>
            <div className="cart-summary-row">
              <span>Items</span>
              <span className="mono">{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
            </div>
            <div className="cart-summary-total">
              <span>Total</span>
              <span className="mono">${subtotal.toFixed(2)}</span>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 20 }}
              onClick={handlePlaceOrder}
              disabled={placingOrder}
            >
              {placingOrder ? 'Placing order…' : 'Place order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CartLine({ item, onUpdateQuantity, onRemove }) {
  const [busy, setBusy] = useState(false);
  const imageUrl = resolveImageUrl(item.image_url);

  async function changeQuantity(next) {
    if (next < 1) return;
    setBusy(true);
    try {
      await onUpdateQuantity(item.product_id, next);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    try {
      await onRemove(item.product_id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cart-item">
      <div className="cart-item-thumb">{imageUrl && <img src={imageUrl} alt={item.title} />}</div>

      <div>
        <div className="cart-item-title">{item.title}</div>
        <div className="cart-item-price mono">${Number(item.price).toFixed(2)} each</div>
      </div>

      <div className="qty-stepper">
        <button type="button" disabled={busy} onClick={() => changeQuantity(item.quantity - 1)} aria-label="Decrease quantity">
          −
        </button>
        <span>{item.quantity}</span>
        <button type="button" disabled={busy} onClick={() => changeQuantity(item.quantity + 1)} aria-label="Increase quantity">
          +
        </button>
      </div>

      <button className="btn btn-secondary btn-sm" disabled={busy} onClick={handleRemove}>
        Remove
      </button>
    </div>
  );
}
