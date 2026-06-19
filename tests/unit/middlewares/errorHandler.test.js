const errorHandler = require('../../../src/middlewares/errorHandler');

describe('errorHandler middleware', () => {
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

  it('should return 500 with a generic error message', () => {
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  it('should not leak the stack trace in the response', () => {
    errorHandler(err, req, res, next);

    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody).not.toHaveProperty('stack');
  });

  it('should not leak the original error message in the response', () => {
    errorHandler(err, req, res, next);

    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody).not.toHaveProperty('message');
  });

  it('should not leak custom error fields (details, code) in the response', () => {
    err.details = 'Sensitive DB details';
    err.code = '23505';

    errorHandler(err, req, res, next);

    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody).not.toHaveProperty('details');
    expect(responseBody).not.toHaveProperty('code');
  });
});
