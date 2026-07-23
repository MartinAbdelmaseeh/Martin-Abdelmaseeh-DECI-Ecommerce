const { PrismaClient } = require('@prisma/client');

// A single shared PrismaClient instance for the whole app — creating a new
// one per request would open a new connection pool each time, which is
// exactly what a singleton here avoids (same reasoning as the old pg.Pool
// setup in the raw-SQL version this replaced).
const prisma = new PrismaClient();

module.exports = prisma;