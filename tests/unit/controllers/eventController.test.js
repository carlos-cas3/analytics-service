const { create, validateCreateEvent } = require('../../../src/controllers/eventController');
const eventService = require('../../../src/services/eventService');
const {
  validEvent,
  eventMissingAllFields,
  eventInvalidUuid,
  eventInvalidType,
  eventInvalidTimestamp,
  eventPayloadAsString,
  eventPayloadNull,
  eventPayloadArray,
} = require('../../fixtures/events');

jest.mock('../../../src/services/eventService');

describe('eventController.validateCreateEvent', () => {
  it('should accumulate all required field errors when body is empty', () => {
    const errors = validateCreateEvent(eventMissingAllFields);

    expect(errors).toHaveLength(7);
    expect(errors).toContain('event_id is required');
    expect(errors).toContain('type is required');
    expect(errors).toContain('service is required');
    expect(errors).toContain('aggregate_type is required');
    expect(errors).toContain('aggregate_id is required');
    expect(errors).toContain('event_timestamp is required');
    expect(errors).toContain('payload is required');
  });

  it('should reject invalid UUID v4 for event_id', () => {
    const errors = validateCreateEvent(eventInvalidUuid);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('event_id must be a valid UUID v4');
  });

  it('should reject invalid event type', () => {
    const errors = validateCreateEvent(eventInvalidType);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^type must be one of:/);
  });

  it('should reject invalid event_timestamp', () => {
    const errors = validateCreateEvent(eventInvalidTimestamp);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('event_timestamp must be a valid ISO date string');
  });

  it('should reject payload when it is a string', () => {
    const errors = validateCreateEvent(eventPayloadAsString);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('payload must be a non-null object');
  });

  it('should reject payload when it is null (caught as required field)', () => {
    const errors = validateCreateEvent(eventPayloadNull);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('payload is required');
  });

  it('should reject payload when it is an array', () => {
    const errors = validateCreateEvent(eventPayloadArray);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('payload must be a non-null object');
  });

  it('should return empty errors for a completely valid event', () => {
    const errors = validateCreateEvent(validEvent);

    expect(errors).toHaveLength(0);
  });
});

describe('eventController.create', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: { ...validEvent },
      ip: '127.0.0.1',
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should return 400 with validation errors when body is invalid', async () => {
    req.body = {};

    await create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      details: expect.arrayContaining(['event_id is required']),
    });
    expect(eventService.processEvent).not.toHaveBeenCalled();
  });

  it('should return 201 when event is new (created: true)', async () => {
    eventService.processEvent.mockResolvedValue({ success: true, created: true });

    await create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, created: true });
    expect(eventService.processEvent).toHaveBeenCalledTimes(1);
  });

  it('should return 200 when event already exists (created: false)', async () => {
    eventService.processEvent.mockResolvedValue({ success: true, created: false });

    await create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, created: false });
  });

  it('should call next(err) when eventService.processEvent throws', async () => {
    const error = new Error('Unexpected error');
    eventService.processEvent.mockRejectedValue(error);

    await create(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});
