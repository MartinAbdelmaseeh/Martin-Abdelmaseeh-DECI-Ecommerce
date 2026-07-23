const STAR = '★';
const EMPTY_STAR = '☆';

export function StarDisplay({ rating, size = 14 }) {
  const rounded = Math.round(rating);
  return (
    <span aria-label={`${rating} out of 5 stars`} style={{ color: 'var(--color-accent)', fontSize: size, letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n}>{n <= rounded ? STAR : EMPTY_STAR}</span>
      ))}
    </span>
  );
}

export function StarPicker({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Rating" style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          onClick={() => onChange(n)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 24,
            lineHeight: 1,
            padding: 2,
            color: n <= value ? 'var(--color-accent)' : 'var(--color-text-faint)',
          }}
        >
          {n <= value ? STAR : EMPTY_STAR}
        </button>
      ))}
    </div>
  );
}
