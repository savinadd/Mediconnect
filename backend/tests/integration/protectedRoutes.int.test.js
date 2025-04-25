const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');

describe('Protected Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secret';
  });

  it('GET /api/protected → 401 without token', async () => {
    const res = await request(app).get('/api/protected');
    expect(res.status).toBe(401);
  });

  it('GET /api/protected → 200 returns user', async () => {
    jwt.verify.mockReturnValue({ userId: 1, role: 'user' });
    const res = await request(app).get('/api/protected').set('Cookie', 'token=abc');
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ userId: 1, role: 'user' });
  });
});
