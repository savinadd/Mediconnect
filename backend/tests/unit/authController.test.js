const db = require('../../src/db');
jest.mock('../../src/db');
const bcrypt = require('bcryptjs');
jest.mock('bcryptjs');
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');

const { BadRequestError, InternalServerError, AppError } = require('../../src/utils/errors');

const {
  registerUser,
  loginUser,
  logoutUser,
  getRegistrationRole,
} = require('../../src/controllers/authController');

function mockResponse() {
  const res = {};
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'secret';
});

describe('registerUser', () => {
  it('throws BadRequestError when missing fields', async () => {
    await expect(registerUser({ body: {} }, mockResponse())).rejects.toBeInstanceOf(
      BadRequestError
    );
  });

  it('throws BadRequestError on invalid email', async () => {
    await expect(
      registerUser({ body: { email: 'x', password: 'A1!abc', role: 'patient' } }, mockResponse())
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws BadRequestError on weak password', async () => {
    await expect(
      registerUser({ body: { email: 'a@b.com', password: 'abc', role: 'patient' } }, mockResponse())
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws BadRequestError on invalid role', async () => {
    await expect(
      registerUser({ body: { email: 'a@b.com', password: 'A1!abc', role: 'x' } }, mockResponse())
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws BadRequestError when email exists', async () => {
    db.query.mockResolvedValue({ rows: [1] });
    await expect(
      registerUser(
        { body: { email: 'a@b.com', password: 'A1!abc', role: 'patient' } },
        mockResponse()
      )
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('registers successfully', async () => {
    // First call: duplicate check; second call: insert
    db.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ id: 42 }] });
    bcrypt.hash.mockResolvedValue('h');
    jwt.sign.mockReturnValue('t');

    const res = mockResponse();
    await registerUser({ body: { email: 'a@b.com', password: 'A1!abc', role: 'patient' } }, res);

    expect(res.cookie).toHaveBeenCalledWith('token', 't', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Registration successful. Please complete your profile.',
    });
  });

  it('wraps other errors in InternalServerError', async () => {
    db.query.mockImplementation(() => {
      throw new Error('boom');
    });
    await expect(
      registerUser(
        { body: { email: 'a@b.com', password: 'A1!abc', role: 'patient' } },
        mockResponse()
      )
    ).rejects.toBeInstanceOf(InternalServerError);
  });
});

describe('loginUser', () => {
  it('throws BadRequestError when missing fields', async () => {
    await expect(loginUser({ body: {} }, mockResponse())).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws BadRequestError on invalid credentials', async () => {
    db.query.mockResolvedValue({ rows: [] });
    await expect(
      loginUser({ body: { email: 'a@b.com', password: 'pw' } }, mockResponse())
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws BadRequestError on wrong password', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 1, password_hash: 'h', role: 'patient' }] });
    bcrypt.compare.mockResolvedValue(false);
    await expect(
      loginUser({ body: { email: 'a@b.com', password: 'wrong' } }, mockResponse())
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('logs in successfully', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 2, password_hash: 'h', role: 'doctor' }] });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('tok');

    const res = mockResponse();
    await loginUser({ body: { email: 'a@b.com', password: 'A1!abc' } }, res);

    expect(res.cookie).toHaveBeenCalledWith('token', 'tok', expect.any(Object));
    expect(res.json).toHaveBeenCalledWith({
      message: 'Login successful',
      user: { id: 2, role: 'doctor' },
    });
  });

  it('wraps other errors in InternalServerError', async () => {
    db.query.mockImplementation(() => {
      throw new Error('boom');
    });
    await expect(
      loginUser({ body: { email: 'a@b.com', password: 'A1!abc' } }, mockResponse())
    ).rejects.toBeInstanceOf(InternalServerError);
  });
});

describe('logoutUser', () => {
  it('clears cookie and returns message', () => {
    const res = mockResponse();
    logoutUser({}, res);
    expect(res.clearCookie).toHaveBeenCalledWith('token', expect.any(Object));
    expect(res.json).toHaveBeenCalledWith({ message: 'Logout successful' });
  });
});

describe('getRegistrationRole', () => {
  it('throws BadRequestError when no token', () => {
    expect(() => getRegistrationRole({ cookies: {} }, mockResponse())).toThrow(BadRequestError);
  });

  it('throws BadRequestError on invalid token', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error();
    });
    expect(() => getRegistrationRole({ cookies: { token: 't' } }, mockResponse())).toThrow(
      BadRequestError
    );
  });

  it('returns role when valid', async () => {
    jwt.verify.mockReturnValue({ role: 'admin' });
    const res = mockResponse();
    await getRegistrationRole({ cookies: { token: 't' } }, res);
    expect(res.json).toHaveBeenCalledWith({ role: 'admin' });
  });
});
