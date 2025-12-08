const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const prisma = require('../config/db');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/authMiddleware');

// Register
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const userExists = await prisma.user.findUnique({
    where: { email }
  });

  if (userExists) {
    res.status(400);
    throw new Error('المستخدم موجود بالفعل');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      balance: 0.0, // Default is usually handled by DB, but explicit here
      status: 'active'
    }
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      token: generateToken(user.id),
    });
  } else {
    res.status(400);
    throw new Error('بيانات غير صحيحة');
  }
}));

// Login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (user && (await bcrypt.compare(password, user.password))) {
    if (user.status === 'banned') {
       res.status(403);
       throw new Error('تم حظر حسابك، يرجى الاتصال بالدعم');
    }
    
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      token: generateToken(user.id),
    });
  } else {
    res.status(401);
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }
}));

// Get Profile
router.get('/profile', protect, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  if (user) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      phone: user.phone
    });
  } else {
    res.status(404);
    throw new Error('المستخدم غير موجود');
  }
}));

module.exports = router;