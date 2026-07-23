import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../api/client';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 5;
  const imageUrl = resolveImageUrl(product.image_url);

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={product.title} loading="lazy" />
        ) : (
          <div className="product-card-image-fallback" aria-hidden="true">
            <PlaceholderIcon />
          </div>
        )}
      </div>

      <div className="product-card-body">
        {product.category && <span className="eyebrow">{product.category}</span>}
        <h3 className="product-card-title">{product.title}</h3>
      </div>

      <div className="product-card-spec-strip mono">
        <span className="product-card-price">${Number(product.price).toFixed(2)}</span>
        <span className={`badge ${inStock ? (lowStock ? 'badge-danger' : 'badge-success') : 'badge-danger'}`}>
          {inStock ? (lowStock ? `${product.stock} left` : 'in stock') : 'out of stock'}
        </span>
      </div>
    </Link>
  );
}

function PlaceholderIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="6" width="18" height="12" rx="1.5" />
      <path d="M3 10h18M8 6v4M16 6v4M8 14h.01M12 14h.01M16 14h.01" strokeLinecap="round" />
    </svg>
  );
}
