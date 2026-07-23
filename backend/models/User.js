const prisma = require('../config/prisma');

class User {
  static async create({ name, email, password, role = 'customer' }) {
    return prisma.user.create({
      data: { name, email, password, role },
      select: { id: true, name: true, email: true, role: true, created_at: true },
    });
  }

  static async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  static async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });
  }
  static async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, updated_at: true },
    });
  }
}

module.exports = User;