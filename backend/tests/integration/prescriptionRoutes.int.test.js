const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');
jest.mock('../../src/db');
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');

describe('Prescription Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secret';
  });

  it('POST /api/prescriptions/add → 401 without token', async () => {
    const res = await request(app).post('/api/prescriptions/add');
    expect(res.status).toBe(401);
  });

  it('POST /api/prescriptions/add → 400 missing fields', async () => {
    jwt.verify.mockReturnValue({ userId: 1, role: 'doctor' });
    const res = await request(app)
      .post('/api/prescriptions/add')
      .set('Cookie', 'token=abc')
      .send({ patientName: 'n' });
    expect(res.status).toBe(400);
  });

  it('POST /api/prescriptions/add → 404 drug not found', async () => {
    jwt.verify.mockReturnValue({ userId: 2, role: 'doctor' });
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 10 }] }) // doctor lookup
      .mockResolvedValueOnce({ rows: [] }); // drug lookup
    const res = await request(app)
      .post('/api/prescriptions/add')
      .set('Cookie', 'token=abc')
      .send({ patientName: 'n', patientDob: 'd', patientId: 'i', drugName: 'x', dosage: '1' });
    expect(res.status).toBe(404);
  });

  it('POST /api/prescriptions/add → 201 on success', async () => {
    jwt.verify.mockReturnValue({ userId: 3, role: 'doctor' });
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 11 }] }) // doctor lookup
      .mockResolvedValueOnce({ rows: [{ id: 12 }] }) // drug lookup
      .mockResolvedValueOnce({ rows: [{ id: 13 }] }) // patient lookup
      .mockResolvedValueOnce({}) // insert prescription
      .mockResolvedValueOnce({}); // log activity
    const res = await request(app).post('/api/prescriptions/add').set('Cookie', 'token=abc').send({
      patientName: 'n',
      patientDob: 'd',
      patientId: 'i',
      drugName: 'x',
      dosage: '1',
      instructions: 'ins',
      endDate: null,
    });
    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/Prescription added successfully/);
  });

  it('GET /api/prescriptions/my → 401 without token', async () => {
    const res = await request(app).get('/api/prescriptions/my');
    expect(res.status).toBe(401);
  });

  it('GET /api/prescriptions/my → 200 returns active/history', async () => {
    jwt.verify.mockReturnValue({ userId: 4, role: 'patient' });
    const now = new Date().toISOString();
    const past = new Date(Date.now() - 86400000).toISOString();
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 5, end_date: null },
        { id: 6, end_date: past },
      ],
    });
    const res = await request(app).get('/api/prescriptions/my').set('Cookie', 'token=abc');
    expect(res.status).toBe(200);
    expect(res.body.active).toEqual([{ id: 5, end_date: null }]);
    expect(res.body.history).toEqual([{ id: 6, end_date: past }]);
  });

  it('GET /api/prescriptions/by-doctor → 401 without token', async () => {
    const res = await request(app).get('/api/prescriptions/by-doctor');
    expect(res.status).toBe(401);
  });

  it('GET /api/prescriptions/by-doctor → 404 doctor not found', async () => {
    jwt.verify.mockReturnValue({ userId: 5, role: 'doctor' });
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/prescriptions/by-doctor').set('Cookie', 'token=abc');
    expect(res.status).toBe(404);
  });

  it('GET /api/prescriptions/by-doctor → 200 returns rows', async () => {
    jwt.verify.mockReturnValue({ userId: 6, role: 'doctor' });
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 14 }] })
      .mockResolvedValueOnce({ rows: [{ id: 15 }] });
    const res = await request(app).get('/api/prescriptions/by-doctor').set('Cookie', 'token=abc');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 15 }]);
  });

  it('PUT /api/prescriptions/end/:id → 404 when not exist', async () => {
    jwt.verify.mockReturnValue({ userId: 7, role: 'doctor' });
    db.query.mockResolvedValueOnce({ rowCount: 0 });
    const res = await request(app).put('/api/prescriptions/end/99').set('Cookie', 'token=abc');
    expect(res.status).toBe(404);
  });

  it('PUT /api/prescriptions/end/:id → 200 on success', async () => {
    jwt.verify.mockReturnValue({ userId: 7, role: 'doctor' });
    db.query.mockResolvedValueOnce({ rowCount: 1 });
    const res = await request(app).put('/api/prescriptions/end/10').set('Cookie', 'token=abc');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/marked as ended/);
  });
});
