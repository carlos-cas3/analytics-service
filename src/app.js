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
 * 5. Global error handler – catches unhandled exceptions
 *
 * Listens on the port defined by the `PORT` env var (default 3003).
 * When `PORT_DOCS` is set, a second Express server is started for
 * the Swagger UI documentation at `GET /api/docs`.
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
const PORT = process.env.PORT || 3003;

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

if (process.env.PORT_DOCS) {
  const docsApp = express();
  docsApp.use(docsRoutes);
  docsApp.listen(process.env.PORT_DOCS, () => {
    console.log(`API docs available on http://localhost:${process.env.PORT_DOCS}/api/docs`);
  });
}

module.exports = app;
