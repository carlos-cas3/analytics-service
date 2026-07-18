const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const eventRoutes = require('./routes/eventRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const errorHandler = require('./middlewares/errorHandler');

function createApp() {
  const app = express();


  
  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS ||
    'http://localhost:5137,http://localhost:3001,http://localhost:3006,http://localhost:3002'
  ).split(',');

  app.use(cors({ origin: allowedOrigins }));


  
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });

  app.use(limiter);
  app.use(express.json({ limit: '1mb' }));
  app.use(eventRoutes);
  app.use(analyticsRoutes);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
