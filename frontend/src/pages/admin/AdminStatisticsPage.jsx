import { useState, useEffect } from 'react';
import { statisticsApi } from '../../api/statistics';
import { ApiError } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBanner from '../../components/ErrorBanner';

export default function AdminStatisticsPage() {
  const [overview, setOverview] = useState(null);
  const [timeseries, setTimeseries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([statisticsApi.getOverview(), statisticsApi.getTimeseries(14)])
      .then(([overviewData, timeseriesData]) => {
        setOverview(overviewData);
        setTimeseries(timeseriesData);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load statistics.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <span className="eyebrow">Admin</span>
      <h1 style={{ marginBottom: 8 }}>Store statistics</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 24 }}>
        Sourced from MongoDB — recorded independently of Postgres each time someone registers or places an order.
      </p>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner label="Loading statistics" />
      ) : !overview ? null : (
        <>
          <div className="stats-grid">
            <StatCard label="Total users" value={overview.totalUsers} sub={`+${overview.newUsersLast7Days} last 7 days`} />
            <StatCard label="Total orders" value={overview.totalOrders} sub={`+${overview.ordersLast7Days} last 7 days`} />
            <StatCard label="Total revenue" value={`$${overview.totalRevenue.toFixed(2)}`} />
          </div>

          {timeseries && timeseries.series.length > 0 && (
            <div className="card" style={{ padding: 24, marginTop: 24 }}>
              <h3 style={{ fontSize: 15, marginBottom: 16 }}>Last {timeseries.days} days</h3>
              <TimeseriesTable series={timeseries.series} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="card stat-card">
      <span className="eyebrow">{label}</span>
      <div className="stat-card-value mono">{value}</div>
      {sub && <span className="stat-card-sub mono">{sub}</span>}
    </div>
  );
}

function TimeseriesTable({ series }) {
  // Reshape the flat { _id: { day, type }, count, amount }[] rows into one
  // row per day with signups/orders/revenue side by side.
  const byDay = {};
  for (const row of series) {
    const day = row._id.day;
    byDay[day] = byDay[day] || { day, signups: 0, orders: 0, revenue: 0 };
    if (row._id.type === 'user_registered') byDay[day].signups = row.count;
    if (row._id.type === 'order_placed') {
      byDay[day].orders = row.count;
      byDay[day].revenue = row.amount || 0;
    }
  }
  const rows = Object.values(byDay).sort((a, b) => a.day.localeCompare(b.day));

  return (
    <table className="order-items-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>New users</th>
          <th>Orders</th>
          <th>Revenue</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.day}>
            <td className="mono">{row.day}</td>
            <td className="mono">{row.signups}</td>
            <td className="mono">{row.orders}</td>
            <td className="mono">${Number(row.revenue).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
