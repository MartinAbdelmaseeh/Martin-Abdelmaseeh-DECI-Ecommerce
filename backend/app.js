const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./services/reviews/routes/reviewRoutes');
const statisticsRoutes = require('./services/statistics/routes/statisticsRoutes');

const app = express();

const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true               
}));

app.use(express.json());           
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());           


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is up and running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/statistics', statisticsRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  
  if (err.name === 'MulterError') {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Image must be smaller than 5MB.'
      : err.code === 'LIMIT_UNEXPECTED_FILE'
        ? 'Only JPEG, PNG, WEBP, or GIF images are allowed.'
        : err.message;
    return res.status(400).json({ message });
  }

  console.error('❌ Internal Server Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred on the server',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

module.exports = app;