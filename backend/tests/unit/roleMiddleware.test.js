const { ForbiddenError } = require('../../src/utils/errors');
const { authorizeRoles } = require('../../src/middlewares/roleMiddleware');

describe('authorizeRoles', () => {
  let next, req, res;
  beforeEach(() => {
    next = jest.fn();
    res = {};
  });

  it('calls next if role allowed', () => {
    req = { user: { role: 'admin' } };
    const mw = authorizeRoles('admin', 'user');
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('throws ForbiddenError if user missing', () => {
    req = {};
    const mw = authorizeRoles('admin');
    expect(() => mw(req, res, next)).toThrow(ForbiddenError);
  });

  it('throws ForbiddenError if role not allowed', () => {
    req = { user: { role: 'guest' } };
    const mw = authorizeRoles('admin', 'user');
    expect(() => mw(req, res, next)).toThrow(ForbiddenError);
  });
});
