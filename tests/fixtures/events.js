const authUserCreated = {
  id: '10000000-0000-0000-0000-000000000001',
  event_id: '550e8400-e29b-41d4-a716-446655440001',
  type: 'USER_CREATED',
  service: 'auth-service',
  aggregate_type: 'user',
  aggregate_id: 'user-001',
  vendor_ids: [],
  payload: { email: 'test@example.com' },
  event_timestamp: '2024-01-15T10:30:00.000Z',
};

const authUserStatusChangedApproved = {
  id: '10000000-0000-0000-0000-000000000002',
  event_id: '550e8400-e29b-41d4-a716-446655440002',
  type: 'USER_STATUS_CHANGED',
  service: 'auth-service',
  aggregate_type: 'user',
  aggregate_id: 'user-001',
  vendor_ids: [],
  payload: { status: 'active', previous_status: 'pending' },
  event_timestamp: '2024-01-15T11:00:00.000Z',
};

const authUserStatusChangedRejected = {
  id: '10000000-0000-0000-0000-000000000003',
  event_id: '550e8400-e29b-41d4-a716-446655440003',
  type: 'USER_STATUS_CHANGED',
  service: 'auth-service',
  aggregate_type: 'user',
  aggregate_id: 'user-002',
  vendor_ids: [],
  payload: { status: 'rejected' },
  event_timestamp: '2024-01-15T11:30:00.000Z',
};

const authLoginSuccess = {
  id: '10000000-0000-0000-0000-000000000004',
  event_id: '550e8400-e29b-41d4-a716-446655440004',
  type: 'LOGIN_SUCCESS',
  service: 'auth-service',
  aggregate_type: 'user',
  aggregate_id: 'user-001',
  vendor_ids: [],
  payload: {},
  event_timestamp: '2024-01-15T12:00:00.000Z',
};

const authLoginFailed = {
  id: '10000000-0000-0000-0000-000000000005',
  event_id: '550e8400-e29b-41d4-a716-446655440005',
  type: 'LOGIN_FAILED',
  service: 'auth-service',
  aggregate_type: 'user',
  aggregate_id: 'user-003',
  vendor_ids: [],
  payload: { reason: 'invalid_password' },
  event_timestamp: '2024-01-15T12:30:00.000Z',
};

const vendorVendorCreated = {
  id: '20000000-0000-0000-0000-000000000001',
  event_id: '550e8400-e29b-41d4-a716-446655440010',
  type: 'VENDOR_CREATED',
  service: 'vendor-service',
  aggregate_type: 'vendor',
  aggregate_id: 'vendor-001',
  vendor_ids: ['1'],
  payload: { name: 'Test Vendor' },
  event_timestamp: '2024-01-16T08:00:00.000Z',
};

const vendorVendorUpdated = {
  id: '20000000-0000-0000-0000-000000000002',
  event_id: '550e8400-e29b-41d4-a716-446655440011',
  type: 'VENDOR_UPDATED',
  service: 'vendor-service',
  aggregate_type: 'vendor',
  aggregate_id: 'vendor-001',
  vendor_ids: ['1'],
  payload: { name: 'Updated Vendor' },
  event_timestamp: '2024-01-16T09:00:00.000Z',
};

const vendorVendorStatusChangedInactive = {
  id: '20000000-0000-0000-0000-000000000003',
  event_id: '550e8400-e29b-41d4-a716-446655440012',
  type: 'VENDOR_STATUS_CHANGED',
  service: 'vendor-service',
  aggregate_type: 'vendor',
  aggregate_id: 'vendor-001',
  vendor_ids: ['1'],
  payload: { status: 'INACTIVE' },
  event_timestamp: '2024-01-16T10:00:00.000Z',
};

const vendorVendorStatusChangedActive = {
  id: '20000000-0000-0000-0000-000000000004',
  event_id: '550e8400-e29b-41d4-a716-446655440013',
  type: 'VENDOR_STATUS_CHANGED',
  service: 'vendor-service',
  aggregate_type: 'vendor',
  aggregate_id: 'vendor-002',
  vendor_ids: ['2'],
  payload: { status: 'ACTIVE' },
  event_timestamp: '2024-01-16T11:00:00.000Z',
};

const vendorBranchCreated = {
  id: '20000000-0000-0000-0000-000000000005',
  event_id: '550e8400-e29b-41d4-a716-446655440014',
  type: 'BRANCH_CREATED',
  service: 'vendor-service',
  aggregate_type: 'branch',
  aggregate_id: 'branch-001',
  vendor_ids: ['1'],
  payload: { name: 'Sucursal Centro' },
  event_timestamp: '2024-01-16T12:00:00.000Z',
};

const vendorBranchCreatedNoVendor = {
  id: '20000000-0000-0000-0000-000000000006',
  event_id: '550e8400-e29b-41d4-a716-446655440015',
  type: 'BRANCH_CREATED',
  service: 'vendor-service',
  aggregate_type: 'branch',
  aggregate_id: 'branch-002',
  vendor_ids: [],
  payload: { name: 'Sucursal Sin Vendor' },
  event_timestamp: '2024-01-16T13:00:00.000Z',
};

const vendorBranchStatusChangedInactive = {
  id: '20000000-0000-0000-0000-000000000007',
  event_id: '550e8400-e29b-41d4-a716-446655440016',
  type: 'BRANCH_STATUS_CHANGED',
  service: 'vendor-service',
  aggregate_type: 'branch',
  aggregate_id: 'branch-001',
  vendor_ids: ['1'],
  payload: { status: 'INACTIVE' },
  event_timestamp: '2024-01-16T14:00:00.000Z',
};

const vendorBranchStatusChangedActive = {
  id: '20000000-0000-0000-0000-000000000008',
  event_id: '550e8400-e29b-41d4-a716-446655440017',
  type: 'BRANCH_STATUS_CHANGED',
  service: 'vendor-service',
  aggregate_type: 'branch',
  aggregate_id: 'branch-002',
  vendor_ids: ['1'],
  payload: { status: 'ACTIVE' },
  event_timestamp: '2024-01-16T15:00:00.000Z',
};

const vendorStaffCreated = {
  id: '20000000-0000-0000-0000-000000000009',
  event_id: '550e8400-e29b-41d4-a716-446655440018',
  type: 'STAFF_CREATED',
  service: 'vendor-service',
  aggregate_type: 'staff',
  aggregate_id: 'staff-001',
  vendor_ids: ['1'],
  payload: { name: 'Juan Perez' },
  event_timestamp: '2024-01-16T16:00:00.000Z',
};

const vendorStaffUpdated = {
  id: '20000000-0000-0000-0000-000000000010',
  event_id: '550e8400-e29b-41d4-a716-446655440019',
  type: 'STAFF_UPDATED',
  service: 'vendor-service',
  aggregate_type: 'staff',
  aggregate_id: 'staff-001',
  vendor_ids: ['1'],
  payload: { name: 'Juan Perez Updated' },
  event_timestamp: '2024-01-16T17:00:00.000Z',
};

const vendorStaffStatusChanged = {
  id: '20000000-0000-0000-0000-000000000011',
  event_id: '550e8400-e29b-41d4-a716-446655440020',
  type: 'STAFF_STATUS_CHANGED',
  service: 'vendor-service',
  aggregate_type: 'staff',
  aggregate_id: 'staff-001',
  vendor_ids: ['1'],
  payload: { status: 'INACTIVE' },
  event_timestamp: '2024-01-16T18:00:00.000Z',
};

const eventCrossValidationFail = {
  id: '30000000-0000-0000-0000-000000000001',
  event_id: '550e8400-e29b-41d4-a716-446655440100',
  type: 'USER_CREATED',
  service: 'auth-service',
  aggregate_type: 'vendor',
  aggregate_id: 'vendor-001',
  vendor_ids: [],
  payload: {},
  event_timestamp: '2024-01-15T10:30:00.000Z',
};

const eventUnknownService = {
  id: '30000000-0000-0000-0000-000000000002',
  event_id: '550e8400-e29b-41d4-a716-446655440101',
  type: 'USER_CREATED',
  service: 'unknown-service',
  aggregate_type: 'user',
  aggregate_id: 'user-001',
  vendor_ids: [],
  payload: {},
  event_timestamp: '2024-01-15T10:30:00.000Z',
};

const eventVendorIdsNotArray = {
  id: '30000000-0000-0000-0000-000000000007',
  event_id: '550e8400-e29b-41d4-a716-446655440106',
  type: 'USER_CREATED',
  service: 'auth-service',
  aggregate_type: 'user',
  aggregate_id: 'user-001',
  vendor_ids: null,
  payload: {},
  event_timestamp: '2024-01-15T10:30:00.000Z',
};

const eventTypeNotInService = {
  id: '30000000-0000-0000-0000-000000000008',
  event_id: '550e8400-e29b-41d4-a716-446655440107',
  type: 'VENDOR_CREATED',
  service: 'auth-service',
  aggregate_type: 'vendor',
  aggregate_id: 'vendor-001',
  vendor_ids: [],
  payload: {},
  event_timestamp: '2024-01-15T10:30:00.000Z',
};

const validEvent = {
  event_id: '550e8400-e29b-41d4-a716-446655440000',
  type: 'USER_CREATED',
  service: 'auth-service',
  aggregate_type: 'user',
  aggregate_id: 'user-123',
  vendor_ids: [],
  payload: { key: 'value' },
  event_timestamp: '2024-01-15T10:30:00.000Z',
};

const validEventWithVendor = {
  ...validEvent,
  vendor_ids: ['vendor-456'],
};

const eventVendorIdsWithEmptyString = {
  ...validEvent,
  vendor_ids: ['valid-id', ''],
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
  service: '   ',
};

const eventEmptyAggregateType = {
  ...validEvent,
  aggregate_type: '   ',
};

const eventEmptyAggregateId = {
  ...validEvent,
  aggregate_id: '   ',
};

module.exports = {
  authUserCreated,
  authUserStatusChangedApproved,
  authUserStatusChangedRejected,
  authLoginSuccess,
  authLoginFailed,
  vendorVendorCreated,
  vendorVendorUpdated,
  vendorVendorStatusChangedInactive,
  vendorVendorStatusChangedActive,
  vendorBranchCreated,
  vendorBranchCreatedNoVendor,
  vendorBranchStatusChangedInactive,
  vendorBranchStatusChangedActive,
  vendorStaffCreated,
  vendorStaffUpdated,
  vendorStaffStatusChanged,
  eventCrossValidationFail,
  eventUnknownService,
  eventVendorIdsNotArray,
  eventVendorIdsWithEmptyString,
  eventTypeNotInService,
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
