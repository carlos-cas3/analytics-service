const metricsRepository = require('../../../../src/repositories/metricsRepository');

jest.mock('../../../../src/repositories/metricsRepository');

const { handle } = require('../../../../src/handlers/auth/userCreated.handler');
const { authUserCreated } = require('../../../fixtures/events');

describe('handler userCreated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe incrementar daily_metrics.new_users en 1', async () => {
    // Arrange
    const event = authUserCreated;

    // Act
    await handle(event);

    // Assert
    expect(metricsRepository.incrementDailyMetric).toHaveBeenCalledTimes(1);
    expect(metricsRepository.incrementDailyMetric).toHaveBeenCalledWith(
      '2024-01-15',
      'new_users',
      1,
    );
  });
});
