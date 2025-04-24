const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  InternalServerError,
} = require('../src/utils/errors');

describe('AppError base class', () => {
  it('should set message, statusCode and isOperational', () => {
    const err = new AppError('something went wrong', 418);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('something went wrong');
    expect(err.statusCode).toBe(418);
    expect(err.isOperational).toBe(true);
    expect(typeof err.stack).toBe('string');
  });
});

describe('BadRequestError (400)', () => {
  it('uses default message', () => {
    const err = new BadRequestError();
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Bad request');
  });
  it('accepts a custom message', () => {
    const err = new BadRequestError('email missing');
    expect(err.message).toBe('email missing');
    expect(err.statusCode).toBe(400);
  });
});

describe('UnauthorizedError (401)', () => {
  it('uses default message', () => {
    const err = new UnauthorizedError();
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Unauthorized');
  });
});

describe('ForbiddenError (403)', () => {
  it('uses default message', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Forbidden');
  });
});

describe('NotFoundError (404)', () => {
  it('uses default message', () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not Found');
  });
});

describe('ValidationError (422)', () => {
  it('captures an errors array and default message', () => {
    const sampleErrors = [{ field: 'email', message: 'required' }];
    const err = new ValidationError(sampleErrors);
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(422);
    expect(err.message).toBe('Validation failed');
    expect(err.errors).toBe(sampleErrors);
  });
});

describe('InternalServerError (500)', () => {
  it('uses default message', () => {
    const err = new InternalServerError();
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe('Internal Server Error');
  });
  it('accepts a custom message', () => {
    const err = new InternalServerError('boom');
    expect(err.message).toBe('boom');
    expect(err.statusCode).toBe(500);
  });
});
