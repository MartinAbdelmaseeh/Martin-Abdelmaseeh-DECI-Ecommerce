import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from './ProductCard';

function renderCard(product) {
  return render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>
  );
}

describe('ProductCard', () => {
  test('renders title, category, and formatted price', () => {
    renderCard({ id: '1', title: 'Test Product', category: 'gadgets', price: 25, stock: 10 });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('gadgets')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
  });

  test('shows "in stock" for healthy stock levels', () => {
    renderCard({ id: '1', title: 'Test Product', price: 25, stock: 20 });
    expect(screen.getByText('in stock')).toBeInTheDocument();
  });

  test('shows a low-stock count at or below 5 units', () => {
    renderCard({ id: '1', title: 'Test Product', price: 25, stock: 3 });
    expect(screen.getByText('3 left')).toBeInTheDocument();
  });

  test('shows "out of stock" when stock is 0', () => {
    renderCard({ id: '1', title: 'Test Product', price: 25, stock: 0 });
    expect(screen.getByText('out of stock')).toBeInTheDocument();
  });

  test('links to the correct product detail page', () => {
    renderCard({ id: 'abc-123', title: 'Test Product', price: 25, stock: 10 });
    expect(screen.getByRole('link')).toHaveAttribute('href', '/products/abc-123');
  });

  test('omits the category badge when the product has none', () => {
    renderCard({ id: '1', title: 'No Category Product', price: 5, stock: 1, category: null });
    expect(screen.queryByText('gadgets')).not.toBeInTheDocument();
  });
});
