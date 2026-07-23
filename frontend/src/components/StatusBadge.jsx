const STATUS_STYLES = {
  pending: 'badge',
  paid: 'badge badge-success',
  shipped: 'badge badge-success',
  delivered: 'badge badge-success',
};

export default function StatusBadge({ status }) {
  return <span className={`${STATUS_STYLES[status] || 'badge'} mono`}>{status}</span>;
}
