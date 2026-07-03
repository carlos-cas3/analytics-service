const metricsRepository = require('../../../../src/repositories/metricsRepository');

jest.mock('../../../../src/repositories/metricsRepository');

const { handle } = require('../../../../src/handlers/vendor/vendorCreated.handler');
const { vendorVendorCreated } = require('../../../fixtures/events');

describe('handler vendorCreated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe incrementar daily_metrics.new_vendors y monthly_metrics.total_vendors', async () => {
    // Arrange
    const event = vendorVendorCreated;

    // Act
    await handle(event);

    // Assert
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
