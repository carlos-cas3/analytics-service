const metricsRepository = require('../../../../src/repositories/metricsRepository');

jest.mock('../../../../src/repositories/metricsRepository');

const { handle } = require('../../../../src/handlers/auth/userCreated.handler');
const { authUserCreated } = require('../../../fixtures/events');

describe('userCreated.handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should increment daily_metrics.new_users by 1', async () => {
    await handle(authUserCreated);

    expect(metricsRepository.incrementDailyMetric).toHaveBeenCalledTimes(1);
    expect(metricsRepository.incrementDailyMetric).toHaveBeenCalledWith(
      '2024-01-15',
      'new_users',
      1,
    );
  });
});
