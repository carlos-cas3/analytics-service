const metricsRepository = require('../../../../src/repositories/metricsRepository');

jest.mock('../../../../src/repositories/metricsRepository');

const { handle } = require('../../../../src/handlers/vendor/vendorStatusChanged.handler');
const {
  vendorVendorStatusChangedInactive,
  vendorVendorStatusChangedActive,
} = require('../../../fixtures/events');

describe('handler vendorStatusChanged', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe decrementar total_vendors cuando status=INACTIVE', async () => {
    // Arrange
    const event = vendorVendorStatusChangedInactive;

    // Act
    await handle(event);

    // Assert
    expect(metricsRepository.incrementMonthlyMetric).toHaveBeenCalledWith(
      '2024-01-01',
      'total_vendors',
      -1,
    );
  });

  it('debe no hacer nada cuando status=ACTIVE', async () => {
    // Arrange
    const event = vendorVendorStatusChangedActive;

    // Act
    await handle(event);

    // Assert
    expect(metricsRepository.incrementMonthlyMetric).not.toHaveBeenCalled();
  });
});
