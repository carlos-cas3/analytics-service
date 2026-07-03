const metricsRepository = require('../../../../src/repositories/metricsRepository');

jest.mock('../../../../src/repositories/metricsRepository');

const { handle } = require('../../../../src/handlers/auth/loginFailed.handler');
const { authLoginFailed } = require('../../../fixtures/events');

describe('handler loginFailed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe incrementar daily_metrics.login_failed_count en 1', async () => {
    // Arrange
    const event = authLoginFailed;

    // Act
    await handle(event);

    // Assert
    expect(metricsRepository.incrementDailyMetric).toHaveBeenCalledWith(
      '2024-01-15',
      'login_failed_count',
      1,
    );
  });
});
