const db = require('../src/db');
const {
  getUserProfile,
  getAllDoctors,
  getDoctorId,
  getPatientId,
} = require('../src/controllers/userController');
const { NotFoundError, BadRequestError, InternalServerError } = require('../src/utils/errors');

jest.mock('../src/db');

describe('userController', () => {
  let req, res;

  beforeEach(() => {
    req = { user: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('throws NotFound if user record missing', async () => {
      req.user = { userId: 1, role: 'patient' };
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(getUserProfile(req, res)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('returns incomplete when patient has no profile row', async () => {
      req.user = { userId: 1, role: 'patient' };
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, email: 'e' }] }) // users
        .mockResolvedValueOnce({ rows: [] }); // patients
      await getUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        profileCompleted: false,
        role: 'patient',
        email: 'e',
        userId: 1,
      });
    });

    it('returns full patient profile', async () => {
      req.user = { userId: 2, role: 'patient' };
      db.query.mockResolvedValueOnce({ rows: [{ id: 2, email: 'x' }] }).mockResolvedValueOnce({
        rows: [
          {
            first_name: 'A',
            last_name: 'B',
            birth_date: 'd',
            phone: 'p',
            address: 'a',
            blood_type: 'O',
            height: 'h',
            weight: 'w',
            allergies: 'n',
            government_id: 'G',
          },
        ],
      });
      await getUserProfile(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ first_name: 'A', email: 'x', profileCompleted: true })
      );
    });

    it('throws on DB error', async () => {
      req.user = { userId: 1, role: 'doctor' };
      db.query.mockRejectedValue(new Error());
      await expect(getUserProfile(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe('getAllDoctors', () => {
    it('returns rows', async () => {
      const rows = [{ id: 1, first_name: 'A', last_name: 'B' }];
      db.query.mockResolvedValue({ rows });
      await getAllDoctors(req, res);
      expect(res.json).toHaveBeenCalledWith(rows);
    });
    it('throws on error', async () => {
      db.query.mockRejectedValue(new Error());
      await expect(getAllDoctors(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe('getDoctorId / getPatientId', () => {
    it('returns doctorId', async () => {
      req.user = { userId: 5 };
      db.query.mockResolvedValue({ rows: [{ id: 9 }] });
      await getDoctorId(req, res);
      expect(res.json).toHaveBeenCalledWith({ doctorId: 9 });
    });
    it('wraps doctor error', async () => {
      db.query.mockRejectedValue(new Error());
      await expect(getDoctorId(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
    it('returns patientId', async () => {
      req.user = { userId: 6 };
      db.query.mockResolvedValue({ rows: [{ id: 7 }] });
      await getPatientId(req, res);
      expect(res.json).toHaveBeenCalledWith({ patientId: 7 });
    });
    it('wraps patient error', async () => {
      db.query.mockRejectedValue(new Error());
      await expect(getPatientId(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });
});
