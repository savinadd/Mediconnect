const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');
jest.mock('../../src/db');
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');
jest.mock('../../src/schemas/symptomSchema', () => ({
  symptomSchema: {
    safeParse: data =>
      data.name && data.description
        ? { success: true, data }
        : { success: false, error: { errors: [{ message: 'Required' }] } },
  },
}));

describe('Symptom Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secret';
  });

  it('POST /api/symptoms/log → 401 without token', async () => {
    const res = await request(app).post('/api/symptoms/log');
    expect(res.status).toBe(401);
  });

  it('POST /api/symptoms/log → 400 on invalid body', async () => {
    jwt.verify.mockReturnValue({ userId: 1, role: 'patient' });
    const res = await request(app).post('/api/symptoms/log').set('Cookie', 'token=abc').send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/symptoms/log → 201 on success', async () => {
    jwt.verify.mockReturnValue({ userId: 1, role: 'patient' });
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 30 }] }) // patient lookup
      .mockResolvedValueOnce({ rows: [] }) // existing symptom
      .mockResolvedValueOnce({ rows: [{ id: 40 }] }) // insert symptom
      .mockResolvedValueOnce({}) // insert patientsymptoms
      .mockResolvedValueOnce({}); // logActivity
    const res = await request(app)
      .post('/api/symptoms/log')
      .set('Cookie', 'token=abc')
      .send({ name: 'Headache', description: 'Pain' });
    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/Symptom logged successfully/);
  });

  it('GET /api/symptoms/history → 401 without token', async () => {
    const res = await request(app).get('/api/symptoms/history');
    expect(res.status).toBe(401);
  });

  it('GET /api/symptoms/history → 200 returns rows', async () => {
    jwt.verify.mockReturnValue({ userId: 2, role: 'patient' });
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 31 }] }) // patient lookup
      .mockResolvedValueOnce({
        rows: [{ logged_at: 't', symptom_name: 'S', severity: null, duration: null, notes: null }],
      });
    const res = await request(app).get('/api/symptoms/history').set('Cookie', 'token=abc');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { logged_at: 't', symptom_name: 'S', severity: null, duration: null, notes: null },
    ]);
  });
});
