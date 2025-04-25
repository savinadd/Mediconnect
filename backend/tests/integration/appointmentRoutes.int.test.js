const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');
jest.mock('../../src/db');
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');

describe('Appointment Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secret';
  });

  it('POST /api/appointments/availability → 401 without token', async () => {
    const res = await request(app).post('/api/appointments/availability');
    expect(res.status).toBe(401);
  });

  it('POST /api/appointments/availability → 403 when not doctor', async () => {
    jwt.verify.mockReturnValue({ userId: 2, role: 'patient' });
    const res = await request(app)
      .post('/api/appointments/availability')
      .send({ startTime: 's', endTime: 'e' })
      .set('Cookie', 'token=abc');
    expect(res.status).toBe(403);
  });

  it('POST /api/appointments/availability → 400 when missing body', async () => {
    jwt.verify.mockReturnValue({ userId: 2, role: 'doctor' });
    const res = await request(app)
      .post('/api/appointments/availability')
      .send({})
      .set('Cookie', 'token=abc');
    expect(res.status).toBe(400);
  });

  it('POST /api/appointments/availability → 201 on success', async () => {
    jwt.verify.mockReturnValue({ userId: 3, role: 'doctor' });
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 10 }] }) // doctor lookup
      .mockResolvedValueOnce({}); // insert
    const res = await request(app)
      .post('/api/appointments/availability')
      .send({ startTime: '2021-01-01T10:00:00Z', endTime: '2021-01-01T11:00:00Z' })
      .set('Cookie', 'token=abc');
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: 'Availability added' });
  });

  it('GET /api/appointments/availability/my → 403 when not doctor', async () => {
    jwt.verify.mockReturnValue({ userId: 4, role: 'patient' });
    const res = await request(app)
      .get('/api/appointments/availability/my')
      .set('Cookie', 'token=abc');
    expect(res.status).toBe(403);
  });

  it('GET /api/appointments/availability/my → 200 returns slots', async () => {
    jwt.verify.mockReturnValue({ userId: 4, role: 'doctor' });
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 11 }] }) // doctor lookup
      .mockResolvedValueOnce({ rows: [{ id: 12, start_time: 's', end_time: 'e' }] });
    const res = await request(app)
      .get('/api/appointments/availability/my')
      .set('Cookie', 'token=abc');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 12, start_time: 's', end_time: 'e' }]);
  });
});
