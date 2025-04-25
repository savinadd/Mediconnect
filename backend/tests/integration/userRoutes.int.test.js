const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');
jest.mock('../../src/db');
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secret';
  });

  it('GET /api/user/profile → 401 without token', async () => {
    const res = await request(app).get('/api/user/profile');
    expect(res.status).toBe(401);
  });

  it('GET /api/user/profile → 200 incomplete profile', async () => {
    jwt.verify.mockReturnValue({ userId: 4, role: 'patient' });
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 4, email: 'e' }] })
      .mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/user/profile').set('Cookie', 'token=abc');
    expect(res.status).toBe(200);
    expect(res.body.profileCompleted).toBe(false);
  });

  it('PUT /api/user/profile/edit → 401 without token', async () => {
    const res = await request(app).put('/api/user/profile/edit');
    expect(res.status).toBe(401);
  });

  it('PUT /api/user/profile/edit → 200 on success', async () => {
    jwt.verify.mockReturnValue({ userId: 5, role: 'patient' });
    db.query.mockResolvedValue({ rows: [{ id: 5 }] });
    const body = {
      first_name: 'F',
      last_name: 'L',
      phone: 'P',
      address: 'A',
      birth_date: 'BD',
      government_id: 'G',
      blood_type: 'O+',
      height: 'H',
      weight: 'W',
      allergies: 'AL',
    };
    const res = await request(app)
      .put('/api/user/profile/edit')
      .set('Cookie', 'token=abc')
      .send(body);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Profile updated successfully/);
  });

  it('GET /api/user/doctor-id → 200 returns id', async () => {
    jwt.verify.mockReturnValue({ userId: 6, role: 'doctor' });
    db.query.mockResolvedValueOnce({ rows: [{ id: 60 }] });
    const res = await request(app).get('/api/user/doctor-id').set('Cookie', 'token=abc');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ doctorId: 60 });
  });

  it('GET /api/user/patient-id → 200 returns id', async () => {
    jwt.verify.mockReturnValue({ userId: 7, role: 'patient' });
    db.query.mockResolvedValueOnce({ rows: [{ id: 70 }] });
    const res = await request(app).get('/api/user/patient-id').set('Cookie', 'token=abc');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ patientId: 70 });
  });
});
