const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');
jest.mock('../../src/db');
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');
jest.mock('../../src/schemas/userSchema', () => ({
  patientProfileSchema: { parse: data => data },
  doctorProfileSchema: { parse: data => data },
  adminProfileSchema: { parse: data => data },
}));

describe('Profile Setup Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secret';
  });

  it('returns 401 when no token', async () => {
    const res = await request(app).put('/api/user/profile/setup');
    expect(res.status).toBe(401);
  });

  it('returns 403 for unauthorized role', async () => {
    jwt.verify.mockReturnValue({ userId: 1, role: 'guest' });
    const res = await request(app)
      .put('/api/user/profile/setup')
      .set('Cookie', 'token=abc')
      .send({});
    expect(res.status).toBe(403);
  });

  it('returns 200 and message on valid patient setup', async () => {
    jwt.verify.mockReturnValue({ userId: 2, role: 'patient', email: 'p@p.com' });
    db.query.mockResolvedValueOnce({}); // profile insert only
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
      .put('/api/user/profile/setup')
      .set('Cookie', 'token=abc')
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Profile setup successful' });
  });
});
