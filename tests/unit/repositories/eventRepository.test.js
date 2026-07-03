const supabase = require('../../../src/config/supabase');

jest.mock('../../../src/config/supabase', () => ({
  from: jest.fn(),
}));

const { save } = require('../../../src/repositories/eventRepository');
const { validEvent, validEventWithVendor } = require('../../fixtures/events');

describe('eventRepository.save', () => {
  let mockSelect;
  let mockInsert;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSelect = jest.fn();
    mockInsert = jest.fn(() => ({ select: mockSelect }));
    supabase.from.mockReturnValue({ insert: mockInsert });
  });

  it('debe llamar a supabase.from("events").insert con los datos, onConflict y select correctos', async () => {
    // Arrange
    mockSelect.mockResolvedValue({ data: [{ event_id: validEvent.event_id }], error: null });
    const data = { ...validEvent, source_ip: '127.0.0.1' };

    // Act
    const result = await save(data);

    // Assert
    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(mockInsert).toHaveBeenCalledWith(
      [{
        event_id: validEvent.event_id,
        type: validEvent.type,
        service: validEvent.service,
        aggregate_type: validEvent.aggregate_type,
        aggregate_id: validEvent.aggregate_id,
        vendor_ids: [],
        payload: validEvent.payload,
        event_timestamp: validEvent.event_timestamp,
        source_ip: '127.0.0.1',
      }],
      { onConflict: 'event_id', ignoreDuplicates: true },
    );
    expect(mockSelect).toHaveBeenCalledWith();
    expect(result).toEqual([{ event_id: validEvent.event_id }]);
  });

  it('debe incluir vendor_ids cuando están presentes en los datos', async () => {
    // Arrange
    mockSelect.mockResolvedValue({ data: [{ event_id: validEvent.event_id }], error: null });
    const data = { ...validEventWithVendor, source_ip: '127.0.0.1' };

    // Act
    await save(data);

    // Assert
    expect(mockInsert).toHaveBeenCalledWith(
      [expect.objectContaining({ vendor_ids: ['vendor-456'] })],
      expect.any(Object),
    );
  });

  it('debe asignar array vacío a vendor_ids cuando no se provee', async () => {
    // Arrange
    mockSelect.mockResolvedValue({ data: [], error: null });
    const data = { ...validEvent, source_ip: '127.0.0.1' };
    delete data.vendor_ids;

    // Act
    await save(data);

    // Assert
    expect(mockInsert).toHaveBeenCalledWith(
      [expect.objectContaining({ vendor_ids: [] })],
      expect.any(Object),
    );
  });

  it('debe asignar null a source_ip cuando no se provee', async () => {
    // Arrange
    mockSelect.mockResolvedValue({ data: [], error: null });
    const data = { ...validEvent, vendor_ids: ['v1'] };
    delete data.source_ip;

    // Act
    await save(data);

    // Assert
    expect(mockInsert).toHaveBeenCalledWith(
      [expect.objectContaining({ source_ip: null })],
      expect.any(Object),
    );
  });

  it('debe lanzar error cuando supabase retorna un error', async () => {
    // Arrange
    const dbError = new Error('duplicate key value violates unique constraint');
    mockSelect.mockResolvedValue({ data: null, error: dbError });
    const data = { ...validEvent, source_ip: '127.0.0.1' };

    // Act / Assert
    await expect(save(data)).rejects.toThrow(dbError);
  });
});
