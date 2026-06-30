const metricsRepository = require('../../../../src/repositories/metricsRepository');

jest.mock('../../../../src/repositories/metricsRepository');

const { handle } = require('../../../../src/handlers/vendor/vendorCreated.handler');
const { vendorVendorCreated } = require('../../../fixtures/events');

describe('vendorCreated.handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should increment daily_metrics.new_vendors and monthly_metrics.total_vendors', async () => {
    await handle(vendorVendorCreated);

    expect(metricsRepository.incrementDailyMetric).toHaveBeenCalledWith(
      '2024-01-16',
      'new_vendors',
      1,
    );

    expect(metricsRepository.incrementMonthlyMetric).toHaveBeenCalledWith(
      '2024-01-01',
      'total_vendors',
      1,
    );
  });
});
