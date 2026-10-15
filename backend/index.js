const path = require('path');
const fs = require('fs');

const backendEnv = path.join(__dirname, '.env');
const rootEnv = path.join(__dirname, '..', '.env');
require('dotenv').config({ path: fs.existsSync(backendEnv) ? backendEnv : rootEnv });

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

// Global middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
   origin: process.env.CLIENT_URL || (
    process.env.NODE_ENV === 'production'
      ? 'http://arova-liart.vercel.app'
      : 'http://localhost:5173'
  ),
    credentials: true
  })
);

// Routes
app.get('/health', (req, res) => {
  return res.json({ success: true, message: 'ShopKart API is running' });
});
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// 404 handler
app.use((req, res) => {
  return res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI 

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ShopKart backend running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });
