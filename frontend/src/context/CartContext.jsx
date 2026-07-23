import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const cartItems = await cartApi.get();
      setItems(cartItems);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Reload the cart whenever auth state flips — covers both "just logged
  // in, fetch my cart" and "just logged out, clear the badge."
  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      await cartApi.add(productId, quantity);
      await refresh();
    },
    [refresh]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      await cartApi.updateQuantity(productId, quantity);
      await refresh();
    },
    [refresh]
  );

  const removeItem = useCallback(
    async (productId) => {
      await cartApi.remove(productId);
      await refresh();
    },
    [refresh]
  );

  const clearCart = useCallback(async () => {
    await cartApi.clear();
    await refresh();
  }, [refresh]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const value = { items, loading, itemCount, subtotal, addItem, updateQuantity, removeItem, clearCart, refresh };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
