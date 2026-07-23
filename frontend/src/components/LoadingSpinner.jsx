export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 24, color: 'var(--color-text-muted)' }}>
      <span className="spinner" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  );
}
