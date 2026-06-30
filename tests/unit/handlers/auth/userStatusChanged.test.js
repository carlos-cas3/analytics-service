const metricsRepository = require('../../../../src/repositories/metricsRepository');

jest.mock('../../../../src/repositories/metricsRepository');

const { handle } = require('../../../../src/handlers/auth/userStatusChanged.handler');
const {
  authUserStatusChangedApproved,
  authUserStatusChangedRejected,
} = require('../../../fixtures/events');

describe('userStatusChanged.handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should increment users_approved when status=active and previous_status=pending', async () => {
    await handle(authUserStatusChangedApproved);

    expect(metricsRepository.incrementDailyMetric).toHaveBeenCalledWith(
      '2024-01-15',
      'users_approved',
      1,
    );
  });

  it('should increment users_rejected when status=rejected', async () => {
    await handle(authUserStatusChangedRejected);

    expect(metricsRepository.incrementDailyMetric).toHaveBeenCalledWith(
      '2024-01-15',
      'users_rejected',
      1,
    );
  });

  it('should do nothing for other status transitions', async () => {
    const event = {
      ...authUserStatusChangedApproved,
      payload: { status: 'active', previous_status: 'active' },
    };

    await handle(event);

    expect(metricsRepository.incrementDailyMetric).not.toHaveBeenCalled();
  });
});
