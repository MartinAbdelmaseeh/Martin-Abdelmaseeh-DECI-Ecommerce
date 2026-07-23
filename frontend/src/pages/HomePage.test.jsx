import { describe, test, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../test/mocks/server';
import { renderWithProviders } from '../test/utils';
import HomePage from './HomePage';

const BASE = 'http://localhost:5000/api';

describe('HomePage', () => {
  test('shows a loading state, then the fetched products', async () => {
    renderWithProviders(<HomePage />, { route: '/' });

    expect(screen.getByText(/loading products/i)).toBeInTheDocument();

    expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
  });

  test('filters products by search term', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />, { route: '/' });

    await screen.findByText('Wireless Mouse');

    await user.type(screen.getByPlaceholderText(/search by title/i), 'Keyboard');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.queryByText('Wireless Mouse')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
  });

  test('shows an empty state when nothing matches', async () => {
    server.use(
      http.get(`${BASE}/products`, () =>
        HttpResponse.json({
          products: [],
          pagination: { total: 0, limit: 12, offset: 0, hasMore: false },
        })
      )
    );

    renderWithProviders(<HomePage />, { route: '/' });

    expect(await screen.findByText(/no products match/i)).toBeInTheDocument();
  });

  test('shows an error banner when the request fails', async () => {
    server.use(
      http.get(`${BASE}/products`, () =>
        HttpResponse.json({ message: 'Server exploded' }, { status: 500 })
      )
    );

    renderWithProviders(<HomePage />, { route: '/' });

    expect(await screen.findByRole('alert')).toHaveTextContent('Server exploded');
  });
});