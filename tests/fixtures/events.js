const validEvent = {
  event_id: '550e8400-e29b-41d4-a716-446655440000',
  type: 'USER_CREATED',
  service: 'user-service',
  aggregate_type: 'user',
  aggregate_id: 'user-123',
  event_timestamp: '2024-01-15T10:30:00.000Z',
  payload: { key: 'value' },
};

const validEventWithVendor = {
  ...validEvent,
  vendor_id: 'vendor-456',
};

const eventMissingAllFields = {};

const eventInvalidUuid = {
  ...validEvent,
  event_id: 'not-a-uuid',
};

const eventInvalidType = {
  ...validEvent,
  type: 'INVALID_TYPE',
};

const eventInvalidTimestamp = {
  ...validEvent,
  event_timestamp: 'not-a-date',
};

const eventPayloadAsString = {
  ...validEvent,
  payload: 'string-not-object',
};

const eventPayloadNull = {
  ...validEvent,
  payload: null,
};

const eventPayloadArray = {
  ...validEvent,
  payload: [],
};

const eventEmptyService = {
  ...validEvent,
  service: '',
};

const eventEmptyAggregateType = {
  ...validEvent,
  aggregate_type: '',
};

const eventEmptyAggregateId = {
  ...validEvent,
  aggregate_id: '',
};

module.exports = {
  validEvent,
  validEventWithVendor,
  eventMissingAllFields,
  eventInvalidUuid,
  eventInvalidType,
  eventInvalidTimestamp,
  eventPayloadAsString,
  eventPayloadNull,
  eventPayloadArray,
  eventEmptyService,
  eventEmptyAggregateType,
  eventEmptyAggregateId,
};
