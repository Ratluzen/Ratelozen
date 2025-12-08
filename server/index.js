const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// DB config is just initializing Prisma client now, no explicit connect call needed here
require('./config/db'); 
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

const app = express();

// --- Security & Performance Middleware ---

// Set security HTTP headers
app.use(helmet());

// Compress response bodies
app.use(compression());

// Limit requests from same API (DDoS protection)
const limiter = rateLimit({
  max: 500, // Limit each IP to 500 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Standard Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// New Features Routes
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Ratelozn Backend (Prisma/Postgres) is Ready! 🚀`);
});