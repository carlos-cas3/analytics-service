const { Router } = require('express');
const healthController = require('../controllers/healthController');
const eventController = require('../controllers/eventController');
const apiKeyAuth = require('../middlewares/apiKeyAuth');

/**
 * Express router that defines all API routes for the analytics service.
 *
 * - `GET  /api/health`  – Health check (public)
 * - `POST /api/events`  – Ingest an analytic event (requires `x-api-key`)
 *
 * @module routes/eventRoutes
 * @type {import('express').Router}
 *
 * @example
 * const app = require('express')();
 * app.use(require('./routes/eventRoutes'));
 */
const router = Router();

router.get('/api/health', healthController.check);
router.post('/api/events', apiKeyAuth, eventController.create);

module.exports = router;
