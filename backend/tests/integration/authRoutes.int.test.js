const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');
jest.mock('../../src/db');
const bcrypt = require('bcryptjs');
jest.mock('bcryptjs');
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secret';
  });

  it('POST /api/auth/register → 400 when missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/register → 201 on success', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] }) // duplicate check
      .mockResolvedValueOnce({ rows: [{ id: 10 }] }); // insert
    bcrypt.hash.mockResolvedValue('h');
    jwt.sign.mockReturnValue('token-r');

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'x@y.com', password: 'A1!abc', role: 'patient' });

    expect(res.status).toBe(201);
    expect(res.headers['set-cookie'][0]).toMatch(/token=token-r/);
    expect(res.body.message).toMatch(/Registration successful. Please complete your profile./);
  });

  it('POST /api/auth/login → 400 when missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'u@u.com' });
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/login → 400 on invalid creds', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'u@u.com', password: 'pw' });
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/login → 200 on success', async () => {
    const user = { id: 7, password_hash: 'h', role: 'doctor' };
    db.query.mockResolvedValueOnce({ rows: [user] });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('token-l');

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'u@u.com', password: 'pw' });

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toMatch(/token=token-l/);
    expect(res.body.user).toEqual({ id: 7, role: 'doctor' });
  });

  it('POST /api/auth/logout → 200 and clears cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Logout successful/);
  });

  it('GET /api/auth/registration-role → 400 when no token', async () => {
    const res = await request(app).get('/api/auth/registration-role');
    expect(res.status).toBe(400);
  });

  it('GET /api/auth/registration-role → 200 with valid token', async () => {
    jwt.verify.mockReturnValue({ role: 'admin' });
    const res = await request(app).get('/api/auth/registration-role').set('Cookie', 'token=valid');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ role: 'admin' });
  });
});
