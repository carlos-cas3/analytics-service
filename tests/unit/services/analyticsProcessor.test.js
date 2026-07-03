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

  it('debe llamar al handler y marcar como procesado para un evento válido con handler', async () => {
    // Arrange
    // (eventRepository.markProcessed mockeado automáticamente)

    // Act
    await processEvent(authUserCreated);

    // Assert
    expect(eventRepository.markProcessed).toHaveBeenCalledWith(authUserCreated.id);
  });

  it('debe marcar como procesado y saltar cuando no existe handler', async () => {
    // Arrange
    // (eventRepository.markProcessed mockeado automáticamente)

    // Act
    await processEvent(authLoginSuccess);

    // Assert
    expect(eventRepository.markProcessed).toHaveBeenCalledWith(authLoginSuccess.id);
  });

  it('debe marcar como procesado y saltar cuando el tipo de evento tiene handler null', async () => {
    // Arrange
    // (eventRepository.markProcessed mockeado automáticamente)

    // Act
    await processEvent(vendorStaffCreated);

    // Assert
    expect(eventRepository.markProcessed).toHaveBeenCalledWith(vendorStaffCreated.id);
  });

  it('debe marcar como procesado y registrar inválido para un evento inválido', async () => {
    // Arrange
    // (eventRepository.markProcessed mockeado automáticamente)

    // Act
    await processEvent(eventCrossValidationFail);

    // Assert
    expect(eventRepository.markProcessed).toHaveBeenCalledWith(eventCrossValidationFail.id);
  });

  it('debe NO marcar como procesado cuando el handler lanza un error', async () => {
    // Arrange
    const handler = require('../../../src/handlers/auth/userCreated.handler');
    const originalHandle = handler.handle;
    handler.handle = jest.fn().mockRejectedValue(new Error('DB connection failed'));

    // Act
    await processEvent(authUserCreated);

    // Assert
    expect(eventRepository.markProcessed).not.toHaveBeenCalled();

    // Cleanup
    handler.handle = originalHandle;
  });
});
