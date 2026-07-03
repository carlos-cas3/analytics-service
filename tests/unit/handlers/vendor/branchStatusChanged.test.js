const metricsRepository = require('../../../../src/repositories/metricsRepository');

jest.mock('../../../../src/repositories/metricsRepository');

const { handle } = require('../../../../src/handlers/vendor/branchStatusChanged.handler');
const {
  vendorBranchStatusChangedInactive,
  vendorBranchStatusChangedActive,
  vendorBranchCreatedNoVendor,
} = require('../../../fixtures/events');

describe('handler branchStatusChanged', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe decrementar branches_count cuando status=INACTIVE', async () => {
    // Arrange
    const event = vendorBranchStatusChangedInactive;

    // Act
    await handle(event);

    // Assert
    expect(metricsRepository.incrementVendorDailyMetric).toHaveBeenCalledWith(
      '1',
      '2024-01-16',
      'branches_count',
      -1,
    );
  });

  it('debe incrementar branches_count cuando status=ACTIVE', async () => {
    // Arrange
    const event = vendorBranchStatusChangedActive;

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
    const event = { ...vendorBranchStatusChangedActive, vendor_ids: [] };

    // Act
    await handle(event);

    // Assert
    expect(metricsRepository.incrementVendorDailyMetric).not.toHaveBeenCalled();
  });
});
