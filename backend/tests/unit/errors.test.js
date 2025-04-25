const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  InternalServerError,
} = require('../../src/utils/errors');

describe('Error classes', () => {
  it('AppError sets message and statusCode', () => {
    const e = new AppError('msg', 123);
    expect(e.message).toBe('msg');
    expect(e.statusCode).toBe(123);
    expect(e.isOperational).toBe(true);
  });
  it('BadRequestError defaults', () => {
    const e = new BadRequestError();
    expect(e.statusCode).toBe(400);
  });
  it('UnauthorizedError defaults', () => {
    const e = new UnauthorizedError();
    expect(e.statusCode).toBe(401);
  });
  it('ForbiddenError defaults', () => {
    const e = new ForbiddenError();
    expect(e.statusCode).toBe(403);
  });
  it('NotFoundError defaults', () => {
    const e = new NotFoundError();
    expect(e.statusCode).toBe(404);
  });
  it('ValidationError stores errors', () => {
    const errs = ['a', 'b'];
    const e = new ValidationError(errs);
    expect(e.statusCode).toBe(422);
    expect(e.errors).toBe(errs);
  });
  it('InternalServerError defaults', () => {
    const e = new InternalServerError();
    expect(e.statusCode).toBe(500);
  });
});
