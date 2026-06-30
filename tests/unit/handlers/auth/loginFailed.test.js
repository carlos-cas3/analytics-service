const metricsRepository = require('../../../../src/repositories/metricsRepository');

jest.mock('../../../../src/repositories/metricsRepository');

const { handle } = require('../../../../src/handlers/auth/loginFailed.handler');
const { authLoginFailed } = require('../../../fixtures/events');

describe('loginFailed.handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should increment daily_metrics.login_failed_count by 1', async () => {
    await handle(authLoginFailed);

    expect(metricsRepository.incrementDailyMetric).toHaveBeenCalledWith(
      '2024-01-15',
      'login_failed_count',
      1,
    );
  });
});
