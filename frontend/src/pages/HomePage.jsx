import { useState, useEffect, useCallback } from 'react';
import { productsApi } from '../api/products';
import { ApiError } from '../api/client';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

const PAGE_SIZE = 12;
const SORT_OPTIONS = [
  { value: 'created_at-DESC', label: 'Newest first' },
  { value: 'price-ASC', label: 'Price: low to high' },
  { value: 'price-DESC', label: 'Price: high to low' },
  { value: 'title-ASC', label: 'Title: A–Z' },
];

export default function HomePage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState('created_at-DESC');
  const [offset, setOffset] = useState(0);

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sortBy, order] = sort.split('-');

  useEffect(() => {
    productsApi
      .getCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => {
      });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productsApi.getAll({ search, category, sortBy, order, limit: PAGE_SIZE, offset });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load products right now.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sortBy, order, offset]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setOffset(0);
    setSearch(searchInput.trim());
  }

  return (
    <div className="page">
      <div className="catalog-header">
        <div>
          <span className="eyebrow">Full catalog</span>
          <h1>Browse components</h1>
        </div>

        <form className="catalog-search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Search by title or description…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search products"
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>

        <select
          className="catalog-sort"
          value={category}
          onChange={(e) => {
            setOffset(0);
            setCategory(e.target.value);
          }}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="catalog-sort"
          value={sort}
          onChange={(e) => {
            setOffset(0);
            setSort(e.target.value);
          }}
          aria-label="Sort products"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner label="Loading products" />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>
            No products match{search && ` "${search}"`}
            {category && ` in "${category}"`}
            {!search && !category && ' your filters'}.
          </p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination
            pagination={pagination}
            onPrev={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            onNext={() => setOffset((o) => o + PAGE_SIZE)}
          />
        </>
      )}
    </div>
  );
}
