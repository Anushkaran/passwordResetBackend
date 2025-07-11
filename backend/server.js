// backend/server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
connectDB();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// DEBUG: log every request
app.use((req, res, next) => {
  console.log('>> Incoming:', req.method, req.originalUrl);
  next();
});

// Mount our auth router
app.use('/api/auth', authRoutes);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
