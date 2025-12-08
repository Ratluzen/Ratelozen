
const asyncHandler = require('express-async-handler');
const prisma = require('../config/db');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { 
    productId, productName, productCategory, 
    price, regionId, regionName, 
    denominationId, quantityLabel,
    customInputValue, customInputLabel 
  } = req.body;

  const userId = req.user.id;

  // 1. Get Fresh User Data
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || user.balance < price) {
    res.status(400);
    throw new Error('رصيد المحفظة غير كافي');
  }

  // 2. Check Product Settings
  let product = null;
  if (productId) {
      product = await prisma.product.findUnique({ where: { id: productId } });
  }

  // 3. Auto-Delivery Logic (Check Inventory)
  let deliveredCode = null;
  let status = 'pending';
  let fulfillmentType = 'manual';
  
  if (product && product.apiConfig) {
      try {
        const config = JSON.parse(product.apiConfig);
        if (config && config.type) {
            fulfillmentType = config.type;
        }
      } catch (e) {}
  }

  let stockItemToUpdate = null;

  if (product && product.autoDeliverStock) {
    // Find matching code logic
    const stockItem = await prisma.inventory.findFirst({
      where: {
        productId: productId,
        isUsed: false,
        AND: [
          { OR: [{ regionId: regionId }, { regionId: null }] },
          { OR: [{ denominationId: denominationId }, { denominationId: null }] }
        ]
      }
    });

    if (stockItem) {
      deliveredCode = stockItem.code;
      status = 'completed';
      fulfillmentType = 'stock';
      stockItemToUpdate = stockItem.id;
    }
  }

  // 4. Transaction
  const result = await prisma.$transaction(async (tx) => {
      // Deduct Balance
      await tx.user.update({
          where: { id: userId },
          data: { balance: { decrement: price } }
      });

      // Create Order
      const customId = `#${Math.floor(Math.random() * 90000) + 10000}`;

      const order = await tx.order.create({
          data: {
              id: customId,
              userId: userId,
              userName: user.name,
              productName,
              productId: productId || undefined,
              productCategory,
              regionName,
              regionId,
              quantityLabel,
              denominationId,
              customInputValue,
              customInputLabel,
              amount: price,
              status,
              fulfillmentType,
              deliveredCode
          }
      });

      // Update Inventory
      if (stockItemToUpdate) {
          await tx.inventory.update({
              where: { id: stockItemToUpdate },
              data: {
                  isUsed: true,
                  usedByOrderId: order.id,
                  dateUsed: new Date()
              }
          });
      }
      
      // Log Transaction
      await tx.transaction.create({
          data: {
              userId,
              title: `شراء: ${productName}`,
              amount: price,
              type: 'debit',
              status: 'completed'
          }
      });

      return order;
  });

  res.status(201).json(result);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, deliveredCode, rejectionReason } = req.body;

  const order = await prisma.order.findUnique({ where: { id } });

  if (order) {
    const updateData = { status };
    
    if (status === 'completed') {
        updateData.deliveredCode = deliveredCode;
        updateData.fulfillmentType = 'manual';
    }
    
    if (status === 'cancelled') {
        updateData.rejectionReason = rejectionReason;
        // Refund logic
        await prisma.$transaction(async (tx) => {
             await tx.user.update({
                where: { id: order.userId },
                data: { balance: { increment: order.amount } }
             });
             
             await tx.transaction.create({
                 data: {
                     userId: order.userId,
                     title: `استرداد: ${order.productName}`,
                     amount: order.amount,
                     type: 'credit',
                     status: 'completed'
                 }
             });
        });
    }

    const updatedOrder = await prisma.order.update({
        where: { id },
        data: updateData
    });

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('الطلب غير موجود');
  }
});

module.exports = { createOrder, getMyOrders, getOrders, updateOrderStatus };
