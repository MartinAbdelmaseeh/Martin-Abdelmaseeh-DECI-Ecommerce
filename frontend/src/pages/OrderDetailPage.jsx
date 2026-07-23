import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import { ApiError } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import StatusBadge from '../components/StatusBadge';

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ordersApi
      .getById(id)
      .then(setOrder)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load this order.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page"><LoadingSpinner label="Loading order" /></div>;
  if (error) return <div className="page"><ErrorBanner message={error} /></div>;
  if (!order) return null;

  return (
    <div className="page">
      <Link to="/orders" className="eyebrow" style={{ display: 'inline-block', marginBottom: 24 }}>
        ← Back to my orders
      </Link>

      {location.state?.justPlaced && (
        <div className="alert" style={{ borderColor: 'var(--color-success)', color: 'var(--color-success)', background: 'rgba(95, 216, 160, 0.08)', marginBottom: 20 }}>
          Order placed successfully.
        </div>
      )}

      <div className="card" style={{ padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="eyebrow">Order</span>
            <div className="mono" style={{ fontSize: 15, marginTop: 4 }}>{order.id}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Placed {new Date(order.created_at).toLocaleString()}
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <table className="order-items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td className="mono">{item.quantity}</td>
                <td className="mono">${(Number(item.price) * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, fontSize: 17, fontWeight: 600 }}>
          Total:&nbsp;<span className="mono">${Number(order.total_amount).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
