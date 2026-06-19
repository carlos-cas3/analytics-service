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

  it('should call supabase.from("events").insert with correct data, onConflict, and select', async () => {
    mockSelect.mockResolvedValue({ data: [{ event_id: validEvent.event_id }], error: null });
    const data = { ...validEvent, source_ip: '127.0.0.1' };

    const result = await save(data);

    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(mockInsert).toHaveBeenCalledWith(
      [{
        event_id: validEvent.event_id,
        type: validEvent.type,
        service: validEvent.service,
        aggregate_type: validEvent.aggregate_type,
        aggregate_id: validEvent.aggregate_id,
        vendor_id: null,
        payload: validEvent.payload,
        event_timestamp: validEvent.event_timestamp,
        source_ip: '127.0.0.1',
      }],
      { onConflict: 'event_id', ignoreDuplicates: true },
    );
    expect(mockSelect).toHaveBeenCalledWith();
    expect(result).toEqual([{ event_id: validEvent.event_id }]);
  });

  it('should include vendor_id when present in the data', async () => {
    mockSelect.mockResolvedValue({ data: [{ event_id: validEvent.event_id }], error: null });
    const data = { ...validEventWithVendor, source_ip: '127.0.0.1' };

    await save(data);

    expect(mockInsert).toHaveBeenCalledWith(
      [expect.objectContaining({ vendor_id: 'vendor-456' })],
      expect.any(Object),
    );
  });

  it('should throw when supabase returns an error', async () => {
    const dbError = new Error('duplicate key value violates unique constraint');
    mockSelect.mockResolvedValue({ data: null, error: dbError });
    const data = { ...validEvent, source_ip: '127.0.0.1' };

    await expect(save(data)).rejects.toThrow(dbError);
  });
});
