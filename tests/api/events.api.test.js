const request = require('supertest');
const createApp = require('../../src/createApp');
const supabase = require('../../src/config/supabase');

jest.mock('../../src/config/supabase', () => ({
  from: jest.fn(),
  rpc: jest.fn(),
}));

const VALID_EVENT = {
  event_id: '550e8400-e29b-41d4-a716-446655440000',
  type: 'USER_CREATED',
  service: 'auth-service',
  aggregate_type: 'user',
  aggregate_id: 'user-123',
  vendor_ids: [],
  payload: { email: 'test@example.com' },
  event_timestamp: '2024-01-15T10:30:00.000Z',
};

const API_KEY = 'test-api-key';

describe('GET /api/health', () => {
  let app;
  let mockLimit;
  let mockSelect;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();
    mockLimit = jest.fn();
    mockSelect = jest.fn(() => ({ limit: mockLimit }));
    supabase.from.mockReturnValue({ select: mockSelect });
  });

  it('debe retornar 200 con base de datos conectada cuando Supabase responde OK', async () => {
    // Arrange
    mockLimit.mockResolvedValue({ data: [{ id: 1 }], error: null });

    // Act
    const response = await request(app).get('/api/health');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      database: 'connected',
    });
  });

  it('debe retornar 503 con estado degradado cuando Supabase falla', async () => {
    // Arrange
    mockLimit.mockResolvedValue({ data: null, error: new Error('timeout') });

    // Act
    const response = await request(app).get('/api/health');

    // Assert
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      status: 'degraded',
      database: 'disconnected',
    });
  });
});

describe('POST /api/events', () => {
  let app;
  let mockSelect;
  let mockInsert;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();
    mockSelect = jest.fn();
    mockInsert = jest.fn(() => ({ select: mockSelect }));
    supabase.from.mockReturnValue({ insert: mockInsert });
  });

  it('debe retornar 401 cuando no se envía API key', async () => {
    // Arrange
    const body = { ...VALID_EVENT };

    // Act
    const response = await request(app)
      .post('/api/events')
      .send(body);

    // Assert
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });

  it('debe retornar 401 cuando la API key es inválida', async () => {
    // Arrange
    const body = { ...VALID_EVENT };

    // Act
    const response = await request(app)
      .post('/api/events')
      .set('x-api-key', 'wrong-key')
      .send(body);

    // Assert
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });

  it('debe retornar 400 cuando el body es inválido', async () => {
    // Arrange
    const body = {};

    // Act
    const response = await request(app)
      .post('/api/events')
      .set('x-api-key', API_KEY)
      .send(body);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'Validation failed',
      details: expect.arrayContaining(['event_id is required']),
    });
  });

  it('debe retornar 201 cuando el evento es nuevo', async () => {
    // Arrange
    mockSelect.mockResolvedValue({ data: [{ event_id: VALID_EVENT.event_id }], error: null });

    // Act
    const response = await request(app)
      .post('/api/events')
      .set('x-api-key', API_KEY)
      .send(VALID_EVENT);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ success: true, created: true });
  });

  it('debe retornar 200 cuando el evento es duplicado', async () => {
    // Arrange
    mockSelect.mockResolvedValue({ data: [], error: null });

    // Act
    const response = await request(app)
      .post('/api/events')
      .set('x-api-key', API_KEY)
      .send(VALID_EVENT);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, created: false });
  });

  it('debe retornar 500 cuando el repositorio lanza un error', async () => {
    // Arrange
    mockSelect.mockResolvedValue({ data: null, error: new Error('DB connection failed') });

    // Act
    const response = await request(app)
      .post('/api/events')
      .set('x-api-key', API_KEY)
      .send(VALID_EVENT);

    // Assert
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
