const prisma = require('../config/prisma');
const { Prisma } = require('@prisma/client');

class Order {
  static async createFromCart(userId, cartItems) {
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cannot create an order from an empty cart');
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    return prisma.order.create({
      data: {
        user_id: userId,
        total_amount: totalAmount,
        status: 'pending',
        items: {
          create: cartItems.map((item) => ({
            product_id: item.product_id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });
  }

  static async findByUserId(userId) {
    return prisma.order.findMany({
      where: { user_id: userId },
      include: { items: true },
      orderBy: { created_at: 'desc' },
    });
  }

  static async findById(id) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  static async updateStatus(id, status) {
    try {
      return await prisma.order.update({
        where: { id },
        data: { status },
      });
    } catch (error) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  static async findAll() {
    return prisma.order.findMany({ orderBy: { created_at: 'desc' } });
  }
}

module.exports = Order;