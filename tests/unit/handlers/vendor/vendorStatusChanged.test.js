const metricsRepository = require('../../../../src/repositories/metricsRepository');

jest.mock('../../../../src/repositories/metricsRepository');

const { handle } = require('../../../../src/handlers/vendor/vendorStatusChanged.handler');
const {
  vendorVendorStatusChangedInactive,
  vendorVendorStatusChangedActive,
} = require('../../../fixtures/events');

describe('vendorStatusChanged.handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should decrement total_vendors when status=INACTIVE', async () => {
    await handle(vendorVendorStatusChangedInactive);

    expect(metricsRepository.incrementMonthlyMetric).toHaveBeenCalledWith(
      '2024-01-01',
      'total_vendors',
      -1,
    );
  });

  it('should do nothing when status=ACTIVE', async () => {
    await handle(vendorVendorStatusChangedActive);

    expect(metricsRepository.incrementMonthlyMetric).not.toHaveBeenCalled();
  });
});
