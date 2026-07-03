const errorHandler = require('../../../src/middlewares/errorHandler');

describe('middleware errorHandler', () => {
  let err;
  let req;
  let res;
  let next;

  beforeEach(() => {
    err = new Error('Something went wrong');
    err.stack = 'Error: Something went wrong\n    at Object.<anonymous> (test.js:1:1)';
    req = { method: 'POST', url: '/api/events' };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('debe retornar 500 con mensaje genérico de error', () => {
    // Arrange
    // (err, req, res, next ya configurados en beforeEach)

    // Act
    errorHandler(err, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  it('debe no filtrar el stack trace en la respuesta', () => {
    // Arrange
    // (err, req, res, next ya configurados en beforeEach)

    // Act
    errorHandler(err, req, res, next);

    // Assert
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody).not.toHaveProperty('stack');
  });

  it('debe no filtrar el mensaje de error original en la respuesta', () => {
    // Arrange
    // (err, req, res, next ya configurados en beforeEach)

    // Act
    errorHandler(err, req, res, next);

    // Assert
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody).not.toHaveProperty('message');
  });

  it('debe no filtrar campos de error personalizados (details, code) en la respuesta', () => {
    // Arrange
    err.details = 'Sensitive DB details';
    err.code = '23505';

    // Act
    errorHandler(err, req, res, next);

    // Assert
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody).not.toHaveProperty('details');
    expect(responseBody).not.toHaveProperty('code');
  });
});
