const db = require('../../src/db');
jest.mock('../../src/db');

const {
  patientProfileSchema,
  doctorProfileSchema,
  adminProfileSchema,
} = require('../../src/schemas/userSchema');
jest.mock('../../src/schemas/userSchema');

const { setupUserProfile } = require('../../src/controllers/profileSetupController');
const { BadRequestError } = require('../../src/utils/errors');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'secret';
});

describe('setupUserProfile', () => {
  it('throws BadRequestError for invalid role', async () => {
    await expect(
      setupUserProfile({ user: { role: 'unknown', userId: 1 }, body: {} }, mockResponse())
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('inserts patient profile & returns message', async () => {
    patientProfileSchema.parse.mockReturnValue({
      first_name: 'F',
      last_name: 'L',
      phone: 'P',
      address: 'A',
      birth_date: 'BD',
      government_id: 'G',
      blood_type: 'B',
      height: 'H',
      weight: 'W',
      allergies: 'AL',
    });
    db.query.mockResolvedValue({});
    const req = {
      user: { role: 'patient', userId: 2 },
      body: {
        /* same fields */
      },
    };
    const res = mockResponse();
    await setupUserProfile(req, res);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO patients'),
      expect.any(Array)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Profile setup successful' });
  });
});
