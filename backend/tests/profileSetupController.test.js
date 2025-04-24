const db = require('../src/db');
const jwt = require('jsonwebtoken');
const { setupUserProfile } = require('../src/controllers/profileSetupController');
const { BadRequestError, InternalServerError } = require('../src/utils/errors');
const {
  patientProfileSchema,
  doctorProfileSchema,
  adminProfileSchema,
} = require('../src/schemas/userSchema');

jest.mock('../src/db');
jest.mock('jsonwebtoken');

describe('profileSetupController.setupUserProfile', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { role: null, email: 'x@example.com', password: 'hashed' },
      body: {},
    };
    res = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('throws BadRequestError on unknown role', async () => {
    req.user.role = 'ghost';
    await expect(setupUserProfile(req, res)).rejects.toBeInstanceOf(BadRequestError);
  });

  describe('when role = patient', () => {
    beforeEach(() => {
      req.user.role = 'patient';
      req.body = {
        first_name: 'A',
        last_name: 'B',
        phone: '123',
        address: 'Addr',
        birth_date: '2000-01-01',
        government_id: 'GID',
        blood_type: 'O+',
        height: '170',
        weight: '70',
        allergies: 'none',
      };
    });

    it('inserts into users & patients, sets cookie, returns JSON', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 42 }] }).mockResolvedValueOnce({});
      jwt.sign.mockReturnValue('TOK');

      await setupUserProfile(req, res);

      expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining('INSERT INTO users'), [
        req.user.email,
        req.user.password,
        'patient',
      ]);
      expect(db.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('INSERT INTO patients'),
        expect.arrayContaining([42, 'A', 'B'])
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 42, role: 'patient', email: 'x@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'TOK',
        expect.objectContaining({ httpOnly: true })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Profile setup successful',
        user: { id: 42, role: 'patient', email: 'x@example.com' },
      });
    });

    it('wraps any error as InternalServerError', async () => {
      db.query.mockRejectedValue(new Error('boom'));
      await expect(setupUserProfile(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });
  //i forgot to add doctor and admin
  //***********ADD THISSS */
});
