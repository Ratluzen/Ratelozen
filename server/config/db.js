const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
// This handles the connection pool automatically
const prisma = new PrismaClient();

module.exports = prisma;