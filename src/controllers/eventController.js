const eventService = require('../services/eventService');

const ALLOWED_TYPES = [
  'USER_CREATED',
  'USER_STATUS_CHANGED',
  'ORDER_CREATED',
  'PAYMENT_PROCESSED',
  'VENDOR_CREATED',
  'VENDOR_UPDATED',
  'VENDOR_STATUS_CHANGED',
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'BRANCH_CREATED',
  'BRANCH_STATUS_CHANGED',
  'STAFF_CREATED',
  'STAFF_STATUS_CHANGED',
  'STAFF_UPDATED',
  'ORDER_STATUS_CHANGED',
  'TICKET_CREADO',
  'TICKET_APROBADO',
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates the body of a create-event request.
 *
 * Checks that all required fields are present, `event_id` is a valid
 * UUID v4, `type` is one of the allowed values, and field-specific
 * type constraints are satisfied. Returns an array of error messages;
 * an empty array means the payload is valid.
 *
 * @function
 * @param {Object} body - The parsed request body to validate
 * @param {string} body.event_id - Event UUID
 * @param {string} body.type - Event type
 * @param {string} body.service - Originating service name
 * @param {string} body.aggregate_type - Domain aggregate type
 * @param {string} body.aggregate_id - Domain aggregate identifier
 * @param {string} body.event_timestamp - ISO-8601 timestamp
 * @param {Object} body.payload - Event payload
 * @param {string[]} [body.vendor_ids] - Optional array of vendor identifiers
 * @returns {string[]} Array of validation error messages (empty if valid)
 *
 * @example
 * const errors = validateCreateEvent(req.body);
 * if (errors.length > 0) {
 *   return res.status(400).json({ error: 'Validation failed', details: errors });
 * }
 */
function validateCreateEvent(body) {
  const errors = [];

  const required = [
    'event_id',
    'type',
    'service',
    'aggregate_type',
    'aggregate_id',
    'event_timestamp',
    'payload',
  ];

  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors.push(`${field} is required`);
    }
  }

  if (errors.length > 0) return errors;

  if (!UUID_REGEX.test(body.event_id)) {
    errors.push('event_id must be a valid UUID v4');
  }

  if (!ALLOWED_TYPES.includes(body.type)) {
    errors.push(`type must be one of: ${ALLOWED_TYPES.join(', ')}`);
  }

  if (typeof body.service !== 'string' || body.service.trim() === '') {
    errors.push('service must be a non-empty string');
  }

  if (typeof body.aggregate_type !== 'string' || body.aggregate_type.trim() === '') {
    errors.push('aggregate_type must be a non-empty string');
  }

  if (typeof body.aggregate_id !== 'string' || body.aggregate_id.trim() === '') {
    errors.push('aggregate_id must be a non-empty string');
  }

  if (typeof body.payload !== 'object' || Array.isArray(body.payload) || body.payload === null) {
    errors.push('payload must be a non-null object');
  }

  if (!body.event_timestamp || isNaN(Date.parse(body.event_timestamp))) {
    errors.push('event_timestamp must be a valid ISO date string');
  }

  if (body.vendor_ids !== undefined) {
    if (!Array.isArray(body.vendor_ids)) {
      errors.push('vendor_ids must be an array');
    } else if (!body.vendor_ids.every((v) => typeof v === 'string' && v.trim() !== '')) {
      errors.push('vendor_ids must be an array of non-empty strings');
    }
  }

  return errors;
}

/**
 * Creates a new analytic event.
 *
 * Validates the request body, delegates processing to the service
 * layer, and responds with 201 when a new event is created or 200
 * when a duplicate event_id is detected.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Sends a JSON response with the operation result
 * @throws {Error} Passes unexpected errors to the global error handler via `next(err)`
 *
 * @example
 * // Request body:
 * {
 *   "event_id": "550e8400-e29b-41d4-a716-446655440000",
 *   "type": "USER_CREATED",
 *   "service": "user-service",
 *   "aggregate_type": "user",
 *   "aggregate_id": "user-123",
 *   "vendor_ids": ["vendor-456"],
 *   "payload": { "email": "test@example.com" },
 *   "event_timestamp": "2024-01-15T10:30:00.000Z"
 * }
 * // Response (201):
 * { "success": true, "created": true }
 */
async function create(req, res, next) {
  try {
    const errors = validateCreateEvent(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const data = {
      event_id: req.body.event_id,
      type: req.body.type,
      service: req.body.service,
      aggregate_type: req.body.aggregate_type,
      aggregate_id: req.body.aggregate_id,
      vendor_ids: req.body.vendor_ids || [],
      payload: req.body.payload,
      event_timestamp: new Date(req.body.event_timestamp).toISOString(),
      source_ip: req.ip,
    };

    const result = await eventService.processEvent(data);

    if (result.created) {
      return res.status(201).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// validateCreateEvent is exported for unit testing (pure logic, no dependencies)
module.exports = { create, validateCreateEvent };
