const db = require('../src/db');
const {
  getDoctorsForPatient,
  getChattedDoctorUserIds,
  getPatientsForDoctor,
  getChattedPatientUserIds,
  getChatMessages,
  getUnreadMessages,
} = require('../src/controllers/chatController');
const { InternalServerError, NotFoundError, BadRequestError } = require('../src/utils/errors');

jest.mock('../src/db');

describe('Chat Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, query: {}, user: {} };
    res = { json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('getDoctorsForPatient', () => {
    it('sends all doctors on success', async () => {
      const rows = [{ doctor_id: 1 }, { doctor_id: 2 }];
      db.query.mockResolvedValueOnce({ rows });
      await getDoctorsForPatient(req, res);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it('throws InternalServerError on db failure', async () => {
      db.query.mockRejectedValue(new Error('boom'));
      await expect(getDoctorsForPatient(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe('getChattedDoctorUserIds', () => {
    it('returns an array of user IDs', async () => {
      req.user.userId = 5;
      db.query.mockResolvedValue({ rows: [{ doctor_user_id: 7 }, { doctor_user_id: 8 }] });
      await getChattedDoctorUserIds(req, res);
      expect(res.json).toHaveBeenCalledWith([7, 8]);
    });

    it('throws InternalServerError on failure', async () => {
      req.user.userId = 5;
      db.query.mockRejectedValue(new Error('boom'));
      await expect(getChattedDoctorUserIds(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe('getPatientsForDoctor', () => {
    it('throws NotFoundError if doctor not found', async () => {
      req.user.userId = 9;
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(getPatientsForDoctor(req, res)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('returns contacts on success', async () => {
      req.user.userId = 9;

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 42 }] })
        .mockResolvedValueOnce({ rows: [{ patient_id: 1, patient_name: 'P1' }] });
      await getPatientsForDoctor(req, res);
      expect(res.json).toHaveBeenCalledWith([{ patient_id: 1, patient_name: 'P1' }]);
    });

    it('wraps errors in InternalServerError', async () => {
      req.user.userId = 9;
      db.query.mockRejectedValue(new Error('boom'));
      await expect(getPatientsForDoctor(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe('getChattedPatientUserIds', () => {
    it('returns an array of user IDs', async () => {
      req.user.userId = 10;
      db.query.mockResolvedValue({ rows: [{ patient_user_id: 3 }, { patient_user_id: 4 }] });
      await getChattedPatientUserIds(req, res);
      expect(res.json).toHaveBeenCalledWith([3, 4]);
    });

    it('throws InternalServerError on failure', async () => {
      req.user.userId = 10;
      db.query.mockRejectedValue(new Error());
      await expect(getChattedPatientUserIds(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe('getChatMessages', () => {
    it('returns chat history', async () => {
      req.params.roomId = '1-2';
      const rows = [{ message: 'hi' }];
      db.query.mockResolvedValue({ rows });
      await getChatMessages(req, res);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it('throws InternalServerError on failure', async () => {
      req.params.roomId = '1-2';
      db.query.mockRejectedValue(new Error());
      await expect(getChatMessages(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe('getUnreadMessages', () => {
    it('throws BadRequestError if userId missing', async () => {
      req.query = {};
      await expect(getUnreadMessages(req, res)).rejects.toBeInstanceOf(BadRequestError);
    });

    it('returns unread map on success', async () => {
      req.query.userId = '7';
      db.query.mockResolvedValue({ rows: [{ room_id: '1-7', unread_count: '3' }] });
      await getUnreadMessages(req, res);
      expect(res.json).toHaveBeenCalledWith({ '1-7': 3 });
    });

    it('throws InternalServerError on failure', async () => {
      req.query.userId = '7';
      db.query.mockRejectedValue(new Error());
      await expect(getUnreadMessages(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });
});
