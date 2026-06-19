const { processEvent } = require('../../../src/services/eventService');
const eventRepository = require('../../../src/repositories/eventRepository');
const { validEvent } = require('../../fixtures/events');

jest.mock('../../../src/repositories/eventRepository');

describe('eventService.processEvent', () => {
  const data = { ...validEvent, source_ip: '127.0.0.1' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return created:true when repository saves a new event', async () => {
    eventRepository.save.mockResolvedValue([{ event_id: validEvent.event_id }]);

    const result = await processEvent(data);

    expect(result).toEqual({ success: true, created: true });
  });

  it('should return created:false when repository returns empty array (duplicate)', async () => {
    eventRepository.save.mockResolvedValue([]);

    const result = await processEvent(data);

    expect(result).toEqual({ success: true, created: false });
  });

  it('should return created:false when repository returns null (Supabase ignoreDuplicates)', async () => {
    eventRepository.save.mockResolvedValue(null);

    const result = await processEvent(data);

    expect(result).toEqual({ success: true, created: false });
  });

  it('should call eventRepository.save with the exact data received', async () => {
    eventRepository.save.mockResolvedValue([{ event_id: validEvent.event_id }]);

    await processEvent(data);

    expect(eventRepository.save).toHaveBeenCalledTimes(1);
    expect(eventRepository.save).toHaveBeenCalledWith(data);
  });

  it('should propagate the error when repository throws', async () => {
    const error = new Error('DB connection failed');
    eventRepository.save.mockRejectedValue(error);

    await expect(processEvent(data)).rejects.toThrow(error);
  });
});
