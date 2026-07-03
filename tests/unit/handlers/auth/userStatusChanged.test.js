const metricsRepository = require('../../../../src/repositories/metricsRepository');

jest.mock('../../../../src/repositories/metricsRepository');

const { handle } = require('../../../../src/handlers/auth/userStatusChanged.handler');
const {
  authUserStatusChangedApproved,
  authUserStatusChangedRejected,
} = require('../../../fixtures/events');

describe('handler userStatusChanged', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe incrementar users_approved cuando status=active y previous_status=pending', async () => {
    // Arrange
    const event = authUserStatusChangedApproved;

    // Act
    await handle(event);

    // Assert
    expect(metricsRepository.incrementDailyMetric).toHaveBeenCalledWith(
      '2024-01-15',
      'users_approved',
      1,
    );
  });

  it('debe incrementar users_rejected cuando status=rejected', async () => {
    // Arrange
    const event = authUserStatusChangedRejected;

    // Act
    await handle(event);

    // Assert
    expect(metricsRepository.incrementDailyMetric).toHaveBeenCalledWith(
      '2024-01-15',
      'users_rejected',
      1,
    );
  });

  it('debe no hacer nada para otras transiciones de estado', async () => {
    // Arrange
    const event = {
      ...authUserStatusChangedApproved,
      payload: { status: 'active', previous_status: 'active' },
    };

    // Act
    await handle(event);

    // Assert
    expect(metricsRepository.incrementDailyMetric).not.toHaveBeenCalled();
  });
});
