import { describe, test, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../test/mocks/server';
import { setMockUser, seedCartItems } from '../test/mocks/handlers';
import { makeUser } from '../test/mocks/fixtures';
import { renderWithProviders } from '../test/utils';
import CartPage from './CartPage';

const BASE = 'http://localhost:5000/api';

const cartItem = {
  item_id: 'item-1',
  product_id: 'prod-1',
  title: 'Wireless Mouse',
  price: 19.99,
  image_url: null,
  quantity: 2,
};

describe('CartPage', () => {
  test('shows an empty state when the cart has no items', async () => {
    setMockUser(makeUser());
    renderWithProviders(<CartPage />, { route: '/cart' });

    expect(await screen.findByText(/your cart is empty/i)).toBeInTheDocument();
  });

  test('renders items and the correct subtotal', async () => {
    setMockUser(makeUser());
    seedCartItems([cartItem]);

    renderWithProviders(<CartPage />, { route: '/cart' });

    expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('$39.98')).toBeInTheDocument();
  });

  test('increasing quantity sends the updated value to the server', async () => {
    setMockUser(makeUser());
    seedCartItems([cartItem]);

    const updateSpy = vi.fn();
    server.use(
      http.put(`${BASE}/cart/update`, async ({ request }) => {
        const body = await request.json();
        updateSpy(body);
        return HttpResponse.json({
          message: 'Cart item updated',
          item: { ...cartItem, quantity: body.quantity },
        });
      })
    );

    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { route: '/cart' });

    await screen.findByText('Wireless Mouse');
    await user.click(screen.getByRole('button', { name: /increase quantity/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith({ productId: 'prod-1', quantity: 3 });
    });
  });

  test('removing an item clears it from the list', async () => {
    setMockUser(makeUser());
    seedCartItems([cartItem]);

    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { route: '/cart' });

    await screen.findByText('Wireless Mouse');
    await user.click(screen.getByRole('button', { name: /remove/i }));

    await waitFor(() => {
      expect(screen.queryByText('Wireless Mouse')).not.toBeInTheDocument();
    });
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });
});