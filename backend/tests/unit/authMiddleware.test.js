const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../../src/utils/errors');
const { authenticateToken } = require('../../src/middlewares/authMiddleware');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authenticateToken', () => {
  let next, req, res;
  beforeEach(() => {
    next = jest.fn();
    res = mockResponse();
    delete process.env.JWT_SECRET;
  });

  it('throws UnauthorizedError if no token', () => {
    req = { cookies: {}, headers: {} };
    expect(() => authenticateToken(req, res, next)).toThrow(UnauthorizedError);
  });

  it('calls next and sets req.user from cookie token', () => {
    process.env.JWT_SECRET = 'secret';
    req = { cookies: { token: 't1' }, headers: {} };
    jwt.verify.mockReturnValue({ userId: 1, role: 'a' });
    authenticateToken(req, res, next);
    expect(req.user).toEqual({ userId: 1, role: 'a' });
    expect(next).toHaveBeenCalled();
  });

  it('calls next and sets req.user from header token', () => {
    process.env.JWT_SECRET = 'secret';
    req = { cookies: {}, headers: { authorization: 'Bearer t2' } };
    jwt.verify.mockReturnValue({ userId: 2, role: 'b' });
    authenticateToken(req, res, next);
    expect(req.user).toEqual({ userId: 2, role: 'b' });
    expect(next).toHaveBeenCalled();
  });

  it('throws ForbiddenError if verify fails', () => {
    process.env.JWT_SECRET = 'secret';
    req = { cookies: { token: 'tx' }, headers: {} };
    jwt.verify.mockImplementation(() => {
      throw new Error();
    });
    expect(() => authenticateToken(req, res, next)).toThrow(ForbiddenError);
  });
});
