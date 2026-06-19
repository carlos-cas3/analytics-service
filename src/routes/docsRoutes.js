const { Router } = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

/**
 * Express router that serves the Swagger UI documentation.
 *
 * Loads the OpenAPI 3.0 spec from `docs/openapi.yaml` and renders
 * it at `GET /api/docs` using swagger-ui-express.
 *
 * @module routes/docsRoutes
 * @type {import('express').Router}
 *
 * @example
 * const app = require('express')();
 * app.use(require('./routes/docsRoutes'));
 */
const router = Router();

const specPath = path.join(__dirname, '..', '..', 'docs', 'openapi.yaml');
const specContent = fs.readFileSync(specPath, 'utf8');
const swaggerSpec = yaml.load(specContent);

const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3003}`;
swaggerSpec.servers = [{ url: apiUrl, description: 'Analytics Service' }];

router.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = router;
