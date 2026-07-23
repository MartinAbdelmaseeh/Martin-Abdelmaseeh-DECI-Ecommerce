import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi } from '../../api/products';
import { resolveImageUrl, ApiError } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBanner from '../../components/ErrorBanner';

const EMPTY_FORM = { title: '', description: '', price: '', category: '', stock: '' };

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    productsApi
      .getById(id)
      .then((product) => {
        setForm({
          title: product.title,
          description: product.description || '',
          price: product.price,
          category: product.category || '',
          stock: product.stock,
        });
        setExistingImageUrl(product.image_url);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load this product.'))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    setImageFile(file || null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.title || !form.price) {
      setError('Title and price are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, imageFile };
      if (isEditing) {
        await productsApi.update(id, payload);
      } else {
        await productsApi.create(payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save this product.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page"><LoadingSpinner label="Loading product" /></div>;

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : resolveImageUrl(existingImageUrl);

  return (
    <div className="page">
      <span className="eyebrow">Admin</span>
      <h1 style={{ marginBottom: 24 }}>{isEditing ? 'Edit product' : 'New product'}</h1>

      <ErrorBanner message={error} />

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-image-preview">
          {previewUrl ? <img src={previewUrl} alt="" /> : <span>No image</span>}
        </div>

        <div className="field">
          <label htmlFor="image">Product image</label>
          <input id="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} />
        </div>

        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" type="text" required value={form.title} onChange={(e) => updateField('title', e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>

        <div className="admin-form-row">
          <div className="field">
            <label htmlFor="price">Price ($)</label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => updateField('stock', e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <input id="category" type="text" value={form.category} onChange={(e) => updateField('category', e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create product'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/products')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
