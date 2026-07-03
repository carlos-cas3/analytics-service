const metricsRepository = require('../../../../src/repositories/metricsRepository');

jest.mock('../../../../src/repositories/metricsRepository');

const { handle } = require('../../../../src/handlers/vendor/branchCreated.handler');
const { vendorBranchCreated, vendorBranchCreatedNoVendor } = require('../../../fixtures/events');

describe('handler branchCreated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe incrementar vendor_daily_metrics.branches_count cuando vendor_id está presente', async () => {
    // Arrange
    const event = vendorBranchCreated;

    // Act
    await handle(event);

    // Assert
    expect(metricsRepository.incrementVendorDailyMetric).toHaveBeenCalledWith(
      '1',
      '2024-01-16',
      'branches_count',
      1,
    );
  });

  it('debe saltar cuando vendor_ids está vacío', async () => {
    // Arrange
    const event = vendorBranchCreatedNoVendor;

    // Act
    await handle(event);

    // Assert
    expect(metricsRepository.incrementVendorDailyMetric).not.toHaveBeenCalled();
  });
});
