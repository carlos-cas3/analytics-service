const { processEvent } = require('../../../src/services/eventService');
const eventRepository = require('../../../src/repositories/eventRepository');
const { validEvent } = require('../../fixtures/events');

jest.mock('../../../src/repositories/eventRepository');

describe('eventService.processEvent', () => {
  const data = { ...validEvent, source_ip: '127.0.0.1' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe retornar created:true cuando el repositorio guarda un evento nuevo', async () => {
    // Arrange
    eventRepository.save.mockResolvedValue([{ event_id: validEvent.event_id }]);

    // Act
    const result = await processEvent(data);

    // Assert
    expect(result).toEqual({ success: true, created: true });
  });

  it('debe retornar created:false cuando el repositorio retorna array vacío (duplicado)', async () => {
    // Arrange
    eventRepository.save.mockResolvedValue([]);

    // Act
    const result = await processEvent(data);

    // Assert
    expect(result).toEqual({ success: true, created: false });
  });

  it('debe retornar created:false cuando el repositorio retorna null (Supabase ignoreDuplicates)', async () => {
    // Arrange
    eventRepository.save.mockResolvedValue(null);

    // Act
    const result = await processEvent(data);

    // Assert
    expect(result).toEqual({ success: true, created: false });
  });

  it('debe llamar a eventRepository.save con los datos exactos recibidos', async () => {
    // Arrange
    eventRepository.save.mockResolvedValue([{ event_id: validEvent.event_id }]);

    // Act
    await processEvent(data);

    // Assert
    expect(eventRepository.save).toHaveBeenCalledTimes(1);
    expect(eventRepository.save).toHaveBeenCalledWith(data);
  });

  it('debe propagar el error cuando el repositorio lanza una excepción', async () => {
    // Arrange
    const error = new Error('DB connection failed');
    eventRepository.save.mockRejectedValue(error);

    // Act & Assert
    await expect(processEvent(data)).rejects.toThrow(error);
  });
});
