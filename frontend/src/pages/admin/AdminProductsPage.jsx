import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../../api/products';
import { resolveImageUrl, ApiError } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBanner from '../../components/ErrorBanner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // limit=100 keeps this simple for an admin table; revisit with real
      // pagination if the catalog grows past that.
      const data = await productsApi.getAll({ limit: 100, sortBy: 'created_at', order: 'DESC' });
      setProducts(data.products);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.title}"? This can't be undone.`)) return;
    setDeletingId(product.id);
    try {
      await productsApi.remove(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete this product.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page">
      <div className="admin-header">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Manage products</h1>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary">
          + New product
        </Link>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner label="Loading products" />
      ) : products.length === 0 ? (
        <div className="empty-state card">
          <p>No products yet.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const imageUrl = resolveImageUrl(product.image_url);
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-table-thumb">{imageUrl && <img src={imageUrl} alt="" />}</div>
                    </td>
                    <td>{product.title}</td>
                    <td>{product.category || '—'}</td>
                    <td className="mono">${Number(product.price).toFixed(2)}</td>
                    <td className="mono">{product.stock}</td>
                    <td>
                      <div className="admin-table-actions">
                        <Link to={`/admin/products/${product.id}/edit`} className="btn btn-secondary btn-sm">
                          Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(product)}
                          disabled={deletingId === product.id}
                        >
                          {deletingId === product.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
