const prisma = require('../config/prisma');

class Cart {
  
  static async getByUserId(userId) {
    const items = await prisma.cartItem.findMany({
      where: { cart: { user_id: userId } },
      include: { product: true },
    });

    return items.map((item) => ({
      item_id: item.id,
      product_id: item.product.id,
      title: item.product.title,
      price: item.product.price,
      image_url: item.product.image_url,
      quantity: item.quantity,
    }));
  }

  static async addItem(userId, productId, quantity) {
    const cart = await prisma.cart.upsert({
      where: { user_id: userId },
      update: {},
      create: { user_id: userId },
    });


    return prisma.cartItem.upsert({
      where: { cart_id_product_id: { cart_id: cart.id, product_id: productId } },
      update: { quantity: { increment: quantity } },
      create: { cart_id: cart.id, product_id: productId, quantity },
    });
  }

  static async removeItem(userId, productId) {
    const item = await prisma.cartItem.findFirst({
      where: { cart: { user_id: userId }, product_id: productId },
    });
    if (!item) return null;

    return prisma.cartItem.delete({ where: { id: item.id } });
  }

  static async updateQuantity(userId, productId, quantity) {
    const item = await prisma.cartItem.findFirst({
      where: { cart: { user_id: userId }, product_id: productId },
    });
    if (!item) return null;

    return prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
  }

  static async clearCart(userId) {
    await prisma.cartItem.deleteMany({ where: { cart: { user_id: userId } } });
  }
}

module.exports = Cart;