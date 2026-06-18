const eventService = require('../services/eventService');

const ALLOWED_TYPES = [
  'USER_CREATED',
  'USER_STATUS_CHANGED',
  'ORDER_CREATED',
  'PAYMENT_PROCESSED',
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

  return errors;
}

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
      vendor_id: req.body.vendor_id || null,
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

module.exports = { create };
