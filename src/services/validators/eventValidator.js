const VALID_TYPES_BY_SERVICE = {
  'auth-service': [
    'USER_CREATED',
    'USER_STATUS_CHANGED',
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
  ],
  'vendor-service': [
    'VENDOR_CREATED',
    'VENDOR_UPDATED',
    'VENDOR_STATUS_CHANGED',
    'BRANCH_CREATED',
    'BRANCH_STATUS_CHANGED',
    'STAFF_CREATED',
    'STAFF_UPDATED',
    'STAFF_STATUS_CHANGED',
  ],
  'ordenes-service': [
    'ORDER_CREATED',
    'ORDER_STATUS_CHANGED',
  ],
  'postventa-service': [
    'TICKET_CREADO',
    'TICKET_APROBADO',
  ],
};

const VALID_SERVICES = Object.keys(VALID_TYPES_BY_SERVICE);

const AGGREGATE_TYPE_BY_EVENT = {
  USER_CREATED: 'user',
  USER_STATUS_CHANGED: 'user',
  LOGIN_SUCCESS: 'user',
  LOGIN_FAILED: 'user',
  VENDOR_CREATED: 'vendor',
  VENDOR_UPDATED: 'vendor',
  VENDOR_STATUS_CHANGED: 'vendor',
  BRANCH_CREATED: 'branch',
  BRANCH_STATUS_CHANGED: 'branch',
  STAFF_CREATED: 'staff',
  STAFF_UPDATED: 'staff',
  STAFF_STATUS_CHANGED: 'staff',
  ORDER_CREATED: 'orden_maestra',
  ORDER_STATUS_CHANGED: 'sub_orden',
  TICKET_CREADO: 'ticket',
  TICKET_APROBADO: 'ticket',
};

function validateEvent(event) {
  if (!event || typeof event !== 'object') {
    return { valid: false, reason: 'event is not an object' };
  }

  if (!VALID_SERVICES.includes(event.service)) {
    return { valid: false, reason: `unknown service: ${event.service}` };
  }

  if (!VALID_TYPES_BY_SERVICE[event.service].includes(event.type)) {
    return { valid: false, reason: `type "${event.type}" not valid for service "${event.service}"` };
  }

  const expectedAggregate = AGGREGATE_TYPE_BY_EVENT[event.type];
  if (event.aggregate_type !== expectedAggregate) {
    return {
      valid: false,
      reason: `aggregate_type mismatch for event type "${event.type}": expected "${expectedAggregate}", got "${event.aggregate_type}"`,
    };
  }

  if (typeof event.aggregate_id !== 'string' || event.aggregate_id.trim() === '') {
    return { valid: false, reason: 'aggregate_id is empty' };
  }

  if (!event.event_timestamp || Number.isNaN(Date.parse(event.event_timestamp))) {
    return { valid: false, reason: 'event_timestamp is not a valid date' };
  }

  if (!Array.isArray(event.vendor_ids)) {
    return { valid: false, reason: 'vendor_ids must be an array' };
  }

  if (typeof event.payload !== 'object' || event.payload === null || Array.isArray(event.payload)) {
    return { valid: false, reason: 'payload must be a non-null, non-array object' };
  }

  return { valid: true };
}

module.exports = {
  validateEvent,
  VALID_TYPES_BY_SERVICE,
  VALID_SERVICES,
  AGGREGATE_TYPE_BY_EVENT,
};
