export default function Pagination({ pagination, onPrev, onNext }) {
  if (!pagination) return null;
  const { total, limit, offset } = pagination;
  if (total <= limit) return null;

  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(offset + limit, total);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 32 }}>
      <button className="btn btn-secondary btn-sm" onClick={onPrev} disabled={offset === 0}>
        ← Prev
      </button>
      <span className="mono" style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
        {start}–{end} of {total}
      </span>
      <button className="btn btn-secondary btn-sm" onClick={onNext} disabled={!pagination.hasMore}>
        Next →
      </button>
    </div>
  );
}
