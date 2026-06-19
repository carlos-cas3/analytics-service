require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const eventRoutes = require('./routes/eventRoutes');
const docsRoutes = require('./routes/docsRoutes');
const errorHandler = require('./middlewares/errorHandler');

/**
 * Express application instance.
 *
 * Configures the following middleware stack (in order):
 * 1. CORS – restricts origins to `ALLOWED_ORIGINS` env var
 * 2. Rate limiter – 100 requests per 15-minute window per IP
 * 3. JSON body parser – 1 MB limit
 * 4. API routes – health check and event ingestion
 * 5. Swagger UI – OpenAPI documentation at `GET /api/docs`
 * 6. Global error handler – catches unhandled exceptions
 *
 * Listens on the port defined by the `PORT` env var (default 3000).
 *
 * @constant
 * @type {import('express').Express}
 *
 * @example
 * // Start the server
 * const app = require('./app');
 * // app.listen() is called within this module
 */
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
app.use(docsRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Analytics service running on port ${PORT}`);
});

module.exports = app;
