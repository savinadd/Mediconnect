const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');
jest.mock('../../src/db');
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');

describe('Activity Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secret';
  });

  it('GET /api/activity/recent → 401 without token', async () => {
    const res = await request(app).get('/api/activity/recent');
    expect(res.status).toBe(401);
  });

  it('GET /api/activity/recent → 200 with valid token', async () => {
    jwt.verify.mockReturnValue({ userId: 1, role: 'user' });
    db.query.mockResolvedValue({ rows: [{ description: 'act', created_at: 'now' }] });
    const res = await request(app).get('/api/activity/recent').set('Cookie', 'token=abc');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ description: 'act', created_at: 'now' }]);
  });
});
