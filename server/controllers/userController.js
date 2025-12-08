const asyncHandler = require('express-async-handler');
const prisma = require('../config/db');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      balance: true,
      role: true,
      status: true,
      ip: true,
      createdAt: true,
    },
  });
  res.json(users);
});

// @desc    Update user balance
// @route   PUT /api/users/:id/balance
// @access  Private/Admin
const updateUserBalance = asyncHandler(async (req, res) => {
  const { amount, type } = req.body; // type: 'add' or 'deduct'
  const { id } = req.params;
  const numAmount = Number(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    res.status(400);
    throw new Error('Invalid amount');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const newBalance =
    type === 'add'
      ? user.balance + numAmount
      : Math.max(0, user.balance - numAmount);

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { balance: newBalance },
    select: { id: true, balance: true, name: true },
  });

  res.json(updatedUser);
});

// @desc    Update user status (Ban/Unban)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const newStatus = user.status === 'active' ? 'banned' : 'active';

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { status: newStatus },
    select: { id: true, status: true, name: true },
  });

  res.json(updatedUser);
});

module.exports = { getUsers, updateUserBalance, updateUserStatus };