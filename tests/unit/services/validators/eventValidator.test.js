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
  it('should return valid for auth-service USER_CREATED', () => {
    const result = validateEvent(authUserCreated);
    expect(result).toEqual({ valid: true });
  });

  it('should return valid for auth-service LOGIN_FAILED', () => {
    const result = validateEvent(authLoginFailed);
    expect(result).toEqual({ valid: true });
  });

  it('should return valid for vendor-service VENDOR_CREATED', () => {
    const result = validateEvent(vendorVendorCreated);
    expect(result).toEqual({ valid: true });
  });

  it('should return valid for vendor-service BRANCH_CREATED', () => {
    const result = validateEvent(vendorBranchCreated);
    expect(result).toEqual({ valid: true });
  });

  it('should return valid for auth-service LOGIN_SUCCESS (known skip)', () => {
    const result = validateEvent(authLoginSuccess);
    expect(result).toEqual({ valid: true });
  });

  it('should return valid for vendor-service STAFF_CREATED (known skip)', () => {
    const result = validateEvent(vendorStaffCreated);
    expect(result).toEqual({ valid: true });
  });

  it('should reject unknown service', () => {
    const result = validateEvent(eventUnknownService);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('unknown service');
  });

  it('should reject event type not valid for the service', () => {
    const result = validateEvent(eventTypeNotInService);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('not valid for service');
  });

  it('should reject cross-validation failure (type vs aggregate_type)', () => {
    const result = validateEvent(eventCrossValidationFail);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('aggregate_type mismatch');
  });

  it('should reject empty aggregate_id', () => {
    const result = validateEvent(eventEmptyAggregateId);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('aggregate_id is empty');
  });

  it('should reject invalid event_timestamp', () => {
    const result = validateEvent(eventInvalidTimestamp);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('event_timestamp');
  });

  it('should reject null payload', () => {
    const result = validateEvent(eventPayloadNull);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('payload');
  });

  it('should reject array payload', () => {
    const result = validateEvent(eventPayloadArray);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('payload');
  });

  it('should reject non-array vendor_ids', () => {
    const result = validateEvent(eventVendorIdsNotArray);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('vendor_ids');
  });

  it('should return valid false for null input', () => {
    expect(validateEvent(null).valid).toBe(false);
  });

  it('should return valid false for undefined input', () => {
    expect(validateEvent(undefined).valid).toBe(false);
  });
});
