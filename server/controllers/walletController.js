const asyncHandler = require('express-async-handler');
const prisma = require('../config/db');

// @desc    Get current user transaction history
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });
  res.json(transactions);
});

// @desc    Add funds to wallet (Simulation or Admin usage)
// @route   POST /api/wallet/deposit
// @access  Private
const depositFunds = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;
  const userId = req.user.id;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('المبلغ غير صالح');
  }

  // Use a transaction to ensure both user balance and transaction log are updated
  const result = await prisma.$transaction(async (tx) => {
    // 1. Update User Balance
    const user = await tx.user.update({
      where: { id: userId },
      data: { balance: { increment: parseFloat(amount) } }
    });

    // 2. Create Transaction Record
    const transaction = await tx.transaction.create({
      data: {
        userId,
        type: 'deposit',
        amount: parseFloat(amount),
        description: description || 'إيداع رصيد',
        status: 'completed'
      }
    });

    return { user, transaction };
  });

  res.json({
    message: 'تم إضافة الرصيد بنجاح',
    newBalance: result.user.balance,
    transactionId: result.transaction.id
  });
});

module.exports = { getTransactions, depositFunds };