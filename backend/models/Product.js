const prisma = require('../config/prisma');


const SORTABLE_COLUMNS = new Set(['price', 'title', 'created_at']);

class Product {
  static async create({ title, description, price, category, imageUrl, stock }) {
    return prisma.product.create({
      data: { title, description, price, category, image_url: imageUrl, stock: toIntOrDefault(stock, 0) },
    });
  }

  static async findAll({ category, search, sortBy = 'created_at', order = 'DESC', limit = 10, offset = 0 }) {
    const where = buildWhere({ category, search });

    const safeSortBy = SORTABLE_COLUMNS.has(sortBy) ? sortBy : 'created_at';
    const safeOrder = order?.toUpperCase() === 'ASC' ? 'asc' : 'desc';

    return prisma.product.findMany({
      where,
      orderBy: { [safeSortBy]: safeOrder },
      take: limit,
      skip: offset,
    });
  }

  static async count({ category, search }) {
    return prisma.product.count({ where: buildWhere({ category, search }) });
  }

  static async findById(id) {
    return prisma.product.findUnique({ where: { id } });
  }

  static async update(id, { title, description, price, category, imageUrl, stock }) {
    return prisma.product.update({
      where: { id },
      data: { title, description, price, category, image_url: imageUrl, stock: toIntOrDefault(stock) },
    });
  }

  static async delete(id) {
    return prisma.product.delete({ where: { id } });
  }


  static async getCategories() {
    const rows = await prisma.product.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return rows.map((r) => r.category).filter((c) => c !== '');
  }
}


function toIntOrDefault(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  return typeof value === 'number' ? value : parseInt(value, 10);
}

function buildWhere({ category, search }) {
  const where = {};

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  return where;
}

module.exports = Product;