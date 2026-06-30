const metricsRepository = require('../../../../src/repositories/metricsRepository');

jest.mock('../../../../src/repositories/metricsRepository');

const { handle } = require('../../../../src/handlers/vendor/branchStatusChanged.handler');
const {
  vendorBranchStatusChangedInactive,
  vendorBranchStatusChangedActive,
  vendorBranchCreatedNoVendor,
} = require('../../../fixtures/events');

describe('branchStatusChanged.handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should decrement branches_count when status=INACTIVE', async () => {
    await handle(vendorBranchStatusChangedInactive);

    expect(metricsRepository.incrementVendorDailyMetric).toHaveBeenCalledWith(
      '1',
      '2024-01-16',
      'branches_count',
      -1,
    );
  });

  it('should increment branches_count when status=ACTIVE', async () => {
    await handle(vendorBranchStatusChangedActive);

    expect(metricsRepository.incrementVendorDailyMetric).toHaveBeenCalledWith(
      '1',
      '2024-01-16',
      'branches_count',
      1,
    );
  });

  it('should skip when vendor_ids is empty', async () => {
    const event = { ...vendorBranchStatusChangedActive, vendor_ids: [] };
    await handle(event);

    expect(metricsRepository.incrementVendorDailyMetric).not.toHaveBeenCalled();
  });
});
