const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');
jest.mock('../../src/db');
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');

describe('Chat Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secret';
  });

  it('GET /api/chat/doctors → 401 without token', async () => {
    const res = await request(app).get('/api/chat/doctors');
    expect(res.status).toBe(401);
  });

  it('GET /api/chat/doctors → 200 returns doctors', async () => {
    jwt.verify.mockReturnValue({ userId: 1, role: 'patient' });
    const rows = [{ doctor_id: 2, first_name: 'A', last_name: 'B' }];
    db.query.mockResolvedValueOnce({ rows });
    const res = await request(app).get('/api/chat/doctors').set('Cookie', 'token=abc');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
  });

  it('GET /api/chat/chatted-doctors → 200 returns ids', async () => {
    jwt.verify.mockReturnValue({ userId: 1, role: 'patient' });
    db.query.mockResolvedValueOnce({ rows: [{ doctor_user_id: 3 }] });
    const res = await request(app).get('/api/chat/chatted-doctors').set('Cookie', 'token=abc');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([3]);
  });

  it('GET /api/chat/patients → 403 when not doctor', async () => {
    jwt.verify.mockReturnValue({ userId: 1, role: 'patient' });
    const res = await request(app).get('/api/chat/patients').set('Cookie', 'token=abc');
    expect(res.status).toBe(403);
  });

  it('GET /api/chat/patients → 200 when doctor', async () => {
    jwt.verify.mockReturnValue({ userId: 2, role: 'doctor' });
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 4 }] }) // doctor lookup
      .mockResolvedValueOnce({ rows: [{ patient_id: 5 }] });
    const res = await request(app).get('/api/chat/patients').set('Cookie', 'token=abc');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ patient_id: 5 }]);
  });
});
