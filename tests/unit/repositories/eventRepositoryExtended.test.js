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

  it('debe consultar eventos no procesados ordenados por event_timestamp', async () => {
    // Arrange
    mockLimit.mockResolvedValue({ data: [], error: null });

    // Act
    await getUnprocessedBatch(10);

    // Assert
    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(mockLimit).toHaveBeenCalledWith(10);
  });

  it('debe retornar un array de datos cuando existen eventos', async () => {
    // Arrange
    const fakeEvents = [{ id: '1', type: 'USER_CREATED' }];
    mockLimit.mockResolvedValue({ data: fakeEvents, error: null });

    // Act
    const result = await getUnprocessedBatch();

    // Assert
    expect(result).toEqual(fakeEvents);
  });

  it('debe retornar un array vacío cuando data es null', async () => {
    // Arrange
    mockLimit.mockResolvedValue({ data: null, error: null });

    // Act
    const result = await getUnprocessedBatch();

    // Assert
    expect(result).toEqual([]);
  });

  it('debe lanzar error cuando supabase retorna error', async () => {
    // Arrange
    const dbError = new Error('DB error');
    mockLimit.mockResolvedValue({ data: null, error: dbError });

    // Act & Assert
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

  it('debe actualizar processed a true para el id dado', async () => {
    // Arrange
    mockEq.mockResolvedValue({ data: null, error: null });

    // Act
    await markProcessed('event-id-123');

    // Assert
    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(mockUpdate).toHaveBeenCalledWith({ processed: true });
    expect(mockEq).toHaveBeenCalledWith('id', 'event-id-123');
  });

  it('debe lanzar error cuando supabase retorna error', async () => {
    // Arrange
    const dbError = new Error('Update failed');
    mockEq.mockResolvedValue({ data: null, error: dbError });

    // Act & Assert
    await expect(markProcessed('event-id-123')).rejects.toThrow(dbError);
  });
});
