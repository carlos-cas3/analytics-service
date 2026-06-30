const eventRepository = require('../../../src/repositories/eventRepository');
const { processEvent } = require('../../../src/services/analyticsProcessor');

jest.mock('../../../src/repositories/eventRepository');

jest.mock('../../../src/repositories/metricsRepository');

const {
  authUserCreated,
  authLoginSuccess,
  vendorStaffCreated,
  eventCrossValidationFail,
} = require('../../fixtures/events');

describe('analyticsProcessor.processEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call handler and mark processed for a valid event with handler', async () => {
    await processEvent(authUserCreated);

    expect(eventRepository.markProcessed).toHaveBeenCalledWith(authUserCreated.id);
  });

  it('should mark processed and skip when no handler exists', async () => {
    await processEvent(authLoginSuccess);

    expect(eventRepository.markProcessed).toHaveBeenCalledWith(authLoginSuccess.id);
  });

  it('should mark processed and skip when event type has null handler', async () => {
    await processEvent(vendorStaffCreated);

    expect(eventRepository.markProcessed).toHaveBeenCalledWith(vendorStaffCreated.id);
  });

  it('should mark processed and log invalid for invalid event', async () => {
    await processEvent(eventCrossValidationFail);

    expect(eventRepository.markProcessed).toHaveBeenCalledWith(eventCrossValidationFail.id);
  });

  it('should NOT mark processed when handler throws an error', async () => {
    const handler = require('../../../src/handlers/auth/userCreated.handler');
    const originalHandle = handler.handle;
    handler.handle = jest.fn().mockRejectedValue(new Error('DB connection failed'));

    await processEvent(authUserCreated);

    expect(eventRepository.markProcessed).not.toHaveBeenCalled();

    handler.handle = originalHandle;
  });
});
