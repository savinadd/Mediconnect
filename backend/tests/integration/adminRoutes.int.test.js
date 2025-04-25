const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');
jest.mock('../../src/db');
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');

describe('Admin Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secret';
  });

  it('GET /api/admin/summary → 401 without token', async () => {
    const res = await request(app).get('/api/admin/summary');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/summary → 403 when not admin', async () => {
    jwt.verify.mockReturnValue({ userId: 1, role: 'doctor' });
    const res = await request(app).get('/api/admin/summary').set('Cookie', 'token=abc');
    expect(res.status).toBe(403);
  });

  it('GET /api/admin/summary → 200 with summary when admin', async () => {
    jwt.verify.mockReturnValue({ userId: 1, role: 'admin' });
    db.query
      .mockResolvedValueOnce({ rows: [{ count: '5' }] })
      .mockResolvedValueOnce({ rows: [{ count: '2' }] })
      .mockResolvedValueOnce({ rows: [{ count: '3' }] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });
    const res = await request(app).get('/api/admin/summary').set('Cookie', 'token=abc');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      totalUsers: 5,
      totalDoctors: 2,
      totalPatients: 3,
      totalAdmins: 1,
    });
  });

  it('DELETE /api/admin/delete/:userId → 403 when not admin', async () => {
    jwt.verify.mockReturnValue({ userId: 1, role: 'patient' });
    const res = await request(app).delete('/api/admin/delete/7').set('Cookie', 'token=abc');
    expect(res.status).toBe(403);
  });

  it('DELETE /api/admin/delete/:userId → 200 when admin', async () => {
    jwt.verify.mockReturnValue({ userId: 1, role: 'admin' });
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 7 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({});
    const res = await request(app).delete('/api/admin/delete/7').set('Cookie', 'token=abc');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'User deleted successfully' });
  });
});
