require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const eventRoutes = require('./routes/eventRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:5137,http://localhost:3001,http://localhost:3006,http://localhost:3002'
).split(',');

app.use(cors({
  origin: allowedOrigins,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use(limiter);

app.use(express.json({ limit: '1mb' }));

app.use(eventRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Analytics service running on port ${PORT}`);
});

module.exports = app;
