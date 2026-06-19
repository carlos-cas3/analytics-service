const supabase = require('../../../src/config/supabase');

jest.mock('../../../src/config/supabase', () => ({
  from: jest.fn(),
}));

const { check } = require('../../../src/controllers/healthController');

describe('healthController.check', () => {
  let mockLimit;
  let mockSelect;
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLimit = jest.fn();
    mockSelect = jest.fn(() => ({ limit: mockLimit }));
    supabase.from.mockReturnValue({ select: mockSelect });
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('should return 200 with connected database when supabase query succeeds', async () => {
    mockLimit.mockResolvedValue({ data: [{ id: 1 }], error: null });

    await check(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ok', database: 'connected' }),
    );
  });

  it('should return 503 with degraded status when supabase query fails', async () => {
    mockLimit.mockResolvedValue({ data: null, error: new Error('timeout') });

    await check(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'degraded', database: 'disconnected' }),
    );
  });
});
