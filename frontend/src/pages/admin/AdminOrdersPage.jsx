import { useState, useEffect } from 'react';
import { ordersApi } from '../../api/orders';
import { ApiError } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBanner from '../../components/ErrorBanner';
import StatusBadge from '../../components/StatusBadge';

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'delivered'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    ordersApi
      .getAll()
      .then(setOrders)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load orders.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(order, status) {
    setUpdatingId(order.id);
    setError('');
    try {
      const { order: updated } = await ordersApi.updateStatus(order.id, status);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update this order.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="page">
      <span className="eyebrow">Admin</span>
      <h1 style={{ marginBottom: 24 }}>All orders</h1>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner label="Loading orders" />
      ) : orders.length === 0 ? (
        <div className="empty-state card">
          <p>No orders yet.</p>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order.id} className="card order-row">
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
                <select
                  className="order-status-select"
                  value={order.status}
                  disabled={updatingId === order.id}
                  onChange={(e) => handleStatusChange(order, e.target.value)}
                  aria-label={`Update status for order ${order.id}`}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
