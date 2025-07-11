require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');        // your Mongo connection logic
const authRoutes = require('./routes/auth');     // renamed from authRoutes.js
const errorHandler = require('./middleware/errorHandler'); // your global error middleware

const app = express();

// 1. CORS whitelist
const allowedOrigins = [
  'http://localhost:3000',
  (process.env.CLIENT_URL || '').replace(/\/+$/, '')
];

app.use(cors({
  origin: (incomingOrigin, callback) => {
    // allow tools (no origin) or whitelisted origins
    if (!incomingOrigin || allowedOrigins.includes(incomingOrigin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${incomingOrigin}`));
    }
  }
}));

app.use(express.json());
connectDB();

// Health‐check
app.get('/', (req, res) => {
  res.send('✅ API is running');
});

// 2. Mount all auth routes under /api/auth
app.use('/api/auth', authRoutes);

// 3. Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
