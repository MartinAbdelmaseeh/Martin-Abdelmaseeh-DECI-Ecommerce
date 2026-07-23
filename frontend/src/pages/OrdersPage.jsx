import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import { ApiError } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import StatusBadge from '../components/StatusBadge';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ordersApi
      .getMyOrders()
      .then(setOrders)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load your orders.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <span className="eyebrow">Order history</span>
      <h1 style={{ marginBottom: 24 }}>My orders</h1>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner label="Loading your orders" />
      ) : orders.length === 0 ? (
        <div className="empty-state card">
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
            Browse the catalog
          </Link>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`} className="card order-row">
              <div>
                <div className="order-row-id mono">{order.id}</div>
                <div style={{ marginTop: 4, fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {new Date(order.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <div className="order-row-meta">
                <span className="mono">${Number(order.total_amount).toFixed(2)}</span>
                <StatusBadge status={order.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
