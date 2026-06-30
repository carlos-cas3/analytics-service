const metricsRepository = require('../../../../src/repositories/metricsRepository');

jest.mock('../../../../src/repositories/metricsRepository');

const { handle } = require('../../../../src/handlers/vendor/branchCreated.handler');
const { vendorBranchCreated, vendorBranchCreatedNoVendor } = require('../../../fixtures/events');

describe('branchCreated.handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should increment vendor_daily_metrics.branches_count when vendor_id is present', async () => {
    await handle(vendorBranchCreated);

    expect(metricsRepository.incrementVendorDailyMetric).toHaveBeenCalledWith(
      '1',
      '2024-01-16',
      'branches_count',
      1,
    );
  });

  it('should skip when vendor_ids is empty', async () => {
    await handle(vendorBranchCreatedNoVendor);

    expect(metricsRepository.incrementVendorDailyMetric).not.toHaveBeenCalled();
  });
});
