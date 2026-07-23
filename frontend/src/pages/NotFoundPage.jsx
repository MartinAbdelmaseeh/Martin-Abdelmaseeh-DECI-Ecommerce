import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <span className="eyebrow mono">404</span>
      <h1 style={{ marginTop: 12, marginBottom: 12 }}>Page not found</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
        That page doesn't exist, or may have moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to catalog
      </Link>
    </div>
  );
}
