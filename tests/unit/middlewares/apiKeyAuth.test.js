const apiKeyAuth = require('../../../src/middlewares/apiKeyAuth');

describe('middleware apiKeyAuth', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('debe retornar 401 cuando falta el header x-api-key', () => {
    // Arrange
    // (req ya configurado sin headers en beforeEach)

    // Act
    apiKeyAuth(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 cuando el header x-api-key está vacío', () => {
    // Arrange
    req.headers['x-api-key'] = '';

    // Act
    apiKeyAuth(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 cuando x-api-key es incorrecto', () => {
    // Arrange
    req.headers['x-api-key'] = 'wrong-key';

    // Act
    apiKeyAuth(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('debe llamar a next() cuando x-api-key coincide con INTERNAL_API_KEY', () => {
    // Arrange
    req.headers['x-api-key'] = 'test-api-key';

    // Act
    apiKeyAuth(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
