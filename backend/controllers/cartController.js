const Cart = require('../models/Cart');


const getCart = async (req, res) => {
  try {
    const items = await Cart.getByUserId(req.user.id);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};


const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const item = await Cart.addItem(req.user.id, productId, quantity || 1);
    res.json({ message: 'Item added to cart', item });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
};


const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: 'productId and quantity are required' });
    }

    if (quantity <= 0) {
      const removed = await Cart.removeItem(req.user.id, productId);
      return res.json({ message: 'Item removed from cart', item: removed });
    }

    const item = await Cart.updateQuantity(req.user.id, productId, quantity);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    res.json({ message: 'Cart item updated', item });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const removed = await Cart.removeItem(req.user.id, productId);
    if (!removed) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    res.json({ message: 'Item removed from cart', item: removed });
  } catch (error) {
    res.status(500).json({ message: 'Error removing cart item', error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.clearCart(req.user.id);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };