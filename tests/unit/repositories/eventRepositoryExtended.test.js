const supabase = require('../../../src/config/supabase');

jest.mock('../../../src/config/supabase', () => ({
  from: jest.fn(),
}));

const { getUnprocessedBatch, markProcessed } = require('../../../src/repositories/eventRepository');

describe('eventRepository.getUnprocessedBatch', () => {
  let mockOrder;
  let mockLimit;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLimit = jest.fn();
    mockOrder = jest.fn(() => ({ limit: mockLimit }));
    const mockOr = jest.fn(() => ({ order: mockOrder }));
    const mockSelect = jest.fn(() => ({ or: mockOr }));
    supabase.from.mockReturnValue({ select: mockSelect });
  });

  it('should query unprocessed events ordered by event_timestamp', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    await getUnprocessedBatch(10);

    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(mockLimit).toHaveBeenCalledWith(10);
  });

  it('should return data array when events exist', async () => {
    const fakeEvents = [{ id: '1', type: 'USER_CREATED' }];
    mockLimit.mockResolvedValue({ data: fakeEvents, error: null });

    const result = await getUnprocessedBatch();

    expect(result).toEqual(fakeEvents);
  });

  it('should return empty array when data is null', async () => {
    mockLimit.mockResolvedValue({ data: null, error: null });

    const result = await getUnprocessedBatch();

    expect(result).toEqual([]);
  });

  it('should throw when supabase returns error', async () => {
    const dbError = new Error('DB error');
    mockLimit.mockResolvedValue({ data: null, error: dbError });

    await expect(getUnprocessedBatch()).rejects.toThrow(dbError);
  });
});

describe('eventRepository.markProcessed', () => {
  let mockEq;
  let mockUpdate;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEq = jest.fn();
    mockUpdate = jest.fn(() => ({ eq: mockEq }));
    supabase.from.mockReturnValue({ update: mockUpdate });
  });

  it('should update processed to true for the given id', async () => {
    mockEq.mockResolvedValue({ data: null, error: null });

    await markProcessed('event-id-123');

    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(mockUpdate).toHaveBeenCalledWith({ processed: true });
    expect(mockEq).toHaveBeenCalledWith('id', 'event-id-123');
  });

  it('should throw when supabase returns error', async () => {
    const dbError = new Error('Update failed');
    mockEq.mockResolvedValue({ data: null, error: dbError });

    await expect(markProcessed('event-id-123')).rejects.toThrow(dbError);
  });
});
