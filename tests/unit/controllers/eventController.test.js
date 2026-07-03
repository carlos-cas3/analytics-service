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
  eventEmptyService,
  eventEmptyAggregateType,
  eventEmptyAggregateId,
  eventVendorIdsNotArray,
  eventVendorIdsWithEmptyString,
} = require('../../fixtures/events');

jest.mock('../../../src/services/eventService');

describe('eventController.validateCreateEvent', () => {
  it('debe acumular errores de campos requeridos cuando el body está vacío', () => {
    // Arrange
    const input = eventMissingAllFields;

    // Act
    const errors = validateCreateEvent(input);

    // Assert
    expect(errors).toHaveLength(7);
    expect(errors).toContain('event_id is required');
    expect(errors).toContain('type is required');
    expect(errors).toContain('service is required');
    expect(errors).toContain('aggregate_type is required');
    expect(errors).toContain('aggregate_id is required');
    expect(errors).toContain('event_timestamp is required');
    expect(errors).toContain('payload is required');
  });

  it('debe rechazar un UUID v4 inválido para event_id', () => {
    // Arrange
    const input = eventInvalidUuid;

    // Act
    const errors = validateCreateEvent(input);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('event_id must be a valid UUID v4');
  });

  it('debe rechazar un tipo de evento inválido', () => {
    // Arrange
    const input = eventInvalidType;

    // Act
    const errors = validateCreateEvent(input);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^type must be one of:/);
  });

  it('debe rechazar un event_timestamp inválido', () => {
    // Arrange
    const input = eventInvalidTimestamp;

    // Act
    const errors = validateCreateEvent(input);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('event_timestamp must be a valid ISO date string');
  });

  it('debe rechazar payload cuando es un string', () => {
    // Arrange
    const input = eventPayloadAsString;

    // Act
    const errors = validateCreateEvent(input);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('payload must be a non-null object');
  });

  it('debe rechazar payload cuando es null', () => {
    // Arrange
    const input = eventPayloadNull;

    // Act
    const errors = validateCreateEvent(input);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('payload is required');
  });

  it('debe rechazar payload cuando es un array', () => {
    // Arrange
    const input = eventPayloadArray;

    // Act
    const errors = validateCreateEvent(input);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('payload must be a non-null object');
  });

  it('debe retornar errores vacíos para un evento válido', () => {
    // Arrange
    const input = validEvent;

    // Act
    const errors = validateCreateEvent(input);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('debe rechazar service con solo espacios en blanco', () => {
    // Arrange
    const input = eventEmptyService;

    // Act
    const errors = validateCreateEvent(input);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('service must be a non-empty string');
  });

  it('debe rechazar aggregate_type con solo espacios en blanco', () => {
    // Arrange
    const input = eventEmptyAggregateType;

    // Act
    const errors = validateCreateEvent(input);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('aggregate_type must be a non-empty string');
  });

  it('debe rechazar aggregate_id con solo espacios en blanco', () => {
    // Arrange
    const input = eventEmptyAggregateId;

    // Act
    const errors = validateCreateEvent(input);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('aggregate_id must be a non-empty string');
  });

  it('debe rechazar vendor_ids cuando no es un array', () => {
    // Arrange
    const input = eventVendorIdsNotArray;

    // Act
    const errors = validateCreateEvent(input);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('vendor_ids must be an array');
  });

  it('debe rechazar vendor_ids cuando contiene un string vacío', () => {
    // Arrange
    const input = eventVendorIdsWithEmptyString;

    // Act
    const errors = validateCreateEvent(input);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('vendor_ids must be an array of non-empty strings');
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

  it('debe retornar 400 con errores de validación cuando el body es inválido', async () => {
    // Arrange
    req.body = {};

    // Act
    await create(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      details: expect.arrayContaining(['event_id is required']),
    });
    expect(eventService.processEvent).not.toHaveBeenCalled();
  });

  it('debe retornar 201 cuando el evento es nuevo (created: true)', async () => {
    // Arrange
    eventService.processEvent.mockResolvedValue({ success: true, created: true });

    // Act
    await create(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, created: true });
    expect(eventService.processEvent).toHaveBeenCalledTimes(1);
  });

  it('debe retornar 200 cuando el evento ya existe (created: false)', async () => {
    // Arrange
    eventService.processEvent.mockResolvedValue({ success: true, created: false });

    // Act
    await create(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, created: false });
  });

  it('debe llamar a next(err) cuando eventService.processEvent lanza error', async () => {
    // Arrange
    const error = new Error('Unexpected error');
    eventService.processEvent.mockRejectedValue(error);

    // Act
    await create(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('debe asignar array vacío a vendor_ids cuando no se provee en el body', async () => {
    // Arrange
    delete req.body.vendor_ids;
    eventService.processEvent.mockResolvedValue({ success: true, created: true });

    // Act
    await create(req, res, next);

    // Assert
    expect(eventService.processEvent).toHaveBeenCalledWith(
      expect.objectContaining({ vendor_ids: [] }),
    );
  });
});
