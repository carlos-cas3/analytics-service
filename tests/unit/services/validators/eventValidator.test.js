const { validateEvent } = require('../../../../src/services/validators/eventValidator');
const {
  authUserCreated,
  authUserStatusChangedApproved,
  authLoginSuccess,
  authLoginFailed,
  vendorVendorCreated,
  vendorBranchCreated,
  vendorStaffCreated,
  eventCrossValidationFail,
  eventUnknownService,
  eventInvalidTimestamp,
  eventEmptyAggregateId,
  eventPayloadNull,
  eventPayloadArray,
  eventVendorIdsNotArray,
  eventTypeNotInService,
} = require('../../../fixtures/events');

describe('eventValidator.validateEvent', () => {
  it('debe retornar válido para auth-service USER_CREATED', () => {
    // Arrange
    const event = authUserCreated;

    // Act
    const result = validateEvent(event);

    // Assert
    expect(result).toEqual({ valid: true });
  });

  it('debe retornar válido para auth-service LOGIN_FAILED', () => {
    // Arrange
    const event = authLoginFailed;

    // Act
    const result = validateEvent(event);

    // Assert
    expect(result).toEqual({ valid: true });
  });

  it('debe retornar válido para vendor-service VENDOR_CREATED', () => {
    // Arrange
    const event = vendorVendorCreated;

    // Act
    const result = validateEvent(event);

    // Assert
    expect(result).toEqual({ valid: true });
  });

  it('debe retornar válido para vendor-service BRANCH_CREATED', () => {
    // Arrange
    const event = vendorBranchCreated;

    // Act
    const result = validateEvent(event);

    // Assert
    expect(result).toEqual({ valid: true });
  });

  it('debe retornar válido para auth-service LOGIN_SUCCESS (skip conocido)', () => {
    // Arrange
    const event = authLoginSuccess;

    // Act
    const result = validateEvent(event);

    // Assert
    expect(result).toEqual({ valid: true });
  });

  it('debe retornar válido para vendor-service STAFF_CREATED (skip conocido)', () => {
    // Arrange
    const event = vendorStaffCreated;

    // Act
    const result = validateEvent(event);

    // Assert
    expect(result).toEqual({ valid: true });
  });

  it('debe rechazar servicio desconocido', () => {
    // Arrange
    const event = eventUnknownService;

    // Act
    const result = validateEvent(event);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('unknown service');
  });

  it('debe rechazar tipo de evento no válido para el servicio', () => {
    // Arrange
    const event = eventTypeNotInService;

    // Act
    const result = validateEvent(event);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('not valid for service');
  });

  it('debe rechazar fallo de validación cruzada (type vs aggregate_type)', () => {
    // Arrange
    const event = eventCrossValidationFail;

    // Act
    const result = validateEvent(event);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('aggregate_type mismatch');
  });

  it('debe rechazar aggregate_id vacío', () => {
    // Arrange
    const event = eventEmptyAggregateId;

    // Act
    const result = validateEvent(event);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('aggregate_id is empty');
  });

  it('debe rechazar event_timestamp inválido', () => {
    // Arrange
    const event = eventInvalidTimestamp;

    // Act
    const result = validateEvent(event);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('event_timestamp');
  });

  it('debe rechazar payload null', () => {
    // Arrange
    const event = eventPayloadNull;

    // Act
    const result = validateEvent(event);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('payload');
  });

  it('debe rechazar payload tipo array', () => {
    // Arrange
    const event = eventPayloadArray;

    // Act
    const result = validateEvent(event);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('payload');
  });

  it('debe rechazar vendor_ids que no es un array', () => {
    // Arrange
    const event = eventVendorIdsNotArray;

    // Act
    const result = validateEvent(event);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('vendor_ids');
  });

  it('debe retornar valid false para entrada null', () => {
    // Arrange
    const event = null;

    // Act
    const result = validateEvent(event);

    // Assert
    expect(result.valid).toBe(false);
  });

  it('debe retornar valid false para entrada undefined', () => {
    // Arrange
    const event = undefined;

    // Act
    const result = validateEvent(event);

    // Assert
    expect(result.valid).toBe(false);
  });
});
