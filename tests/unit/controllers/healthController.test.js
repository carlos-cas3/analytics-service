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
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLimit = jest.fn();
    mockSelect = jest.fn(() => ({ limit: mockLimit }));
    supabase.from.mockReturnValue({ select: mockSelect });
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('debe retornar 200 con base de datos conectada cuando la consulta a Supabase es exitosa', async () => {
    // Arrange
    mockLimit.mockResolvedValue({ data: [{ id: 1 }], error: null });

    // Act
    await check(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ok', database: 'connected' }),
    );
  });

  it('debe retornar 503 con estado degradado cuando la consulta a Supabase falla', async () => {
    // Arrange
    mockLimit.mockResolvedValue({ data: null, error: new Error('timeout') });

    // Act
    await check(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'degraded', database: 'disconnected' }),
    );
  });

  it('debe reflejar un NODE_ENV personalizado en la respuesta', async () => {
    // Arrange
    process.env.NODE_ENV = 'staging';
    mockLimit.mockResolvedValue({ data: [{ id: 1 }], error: null });

    // Act
    await check(req, res);

    // Assert
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ environment: 'staging' }),
    );
  });

  it('debe usar "development" por defecto cuando NODE_ENV no está definido', async () => {
    // Arrange
    delete process.env.NODE_ENV;
    mockLimit.mockResolvedValue({ data: [{ id: 1 }], error: null });

    // Act
    await check(req, res);

    // Assert
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ environment: 'development' }),
    );
  });
});
