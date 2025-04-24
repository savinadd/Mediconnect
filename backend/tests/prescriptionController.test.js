const db = require('../src/db');
const {
  addPrescription,
  endPrescription,
  getPrescriptionsByDoctor,
  getPrescriptionsForPatient,
} = require('../src/controllers/prescriptionController');
const { BadRequestError, NotFoundError, InternalServerError } = require('../src/utils/errors');
const { logActivity } = require('../src/controllers/activityLogController');

jest.mock('../src/db');
jest.mock('../src/controllers/activityLogController');

describe('Prescription Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('addPrescription', () => {
    beforeEach(() => {
      req.user = { userId: 10, role: 'doctor' };
      req.body = {
        patientName: 'Alice Smith',
        patientDob: '2000-01-01',
        patientId: 'GOV123',
        drugName: 'Ibuprofen',
        dosage: '200mg',
        instructions: 'Take twice',
        endDate: '',
      };
    });

    it('throws BadRequestError if missing required fields', async () => {
      req.body.drugName = '';
      await expect(addPrescription(req, res)).rejects.toBeInstanceOf(BadRequestError);
    });

    it('throws BadRequestError if doctor not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(addPrescription(req, res)).rejects.toBeInstanceOf(BadRequestError);
    });

    it('throws NotFoundError if drug not found', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 5 }] }) // doctor
        .mockResolvedValueOnce({ rows: [] }); // drug
      await expect(addPrescription(req, res)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('throws NotFoundError if patient not found', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 5 }] }) // doctor
        .mockResolvedValueOnce({ rows: [{ id: 2 }] }) // drug
        .mockResolvedValueOnce({ rows: [] }); // patient
      await expect(addPrescription(req, res)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('inserts prescription, logs activity, and returns 201', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 5 }] }) // doctor
        .mockResolvedValueOnce({ rows: [{ id: 2 }] }) // drug
        .mockResolvedValueOnce({ rows: [{ id: 7 }] }) // patient
        .mockResolvedValueOnce({ rows: [] }); // insert
      await addPrescription(req, res);
      expect(db.query).toHaveBeenCalledTimes(4);
      expect(logActivity).toHaveBeenCalledWith(10, 'doctor', expect.stringContaining('Prescribed'));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Prescription added successfully' });
    });

    it('wraps errors in InternalServerError', async () => {
      db.query.mockRejectedValue(new Error());
      await expect(addPrescription(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe('endPrescription', () => {
    it('marks prescription ended and returns message', async () => {
      req.params.id = '42';
      db.query.mockResolvedValue({});
      await endPrescription(req, res);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE prescriptions'), [
        '42',
      ]);
      expect(res.json).toHaveBeenCalledWith({ message: 'Prescription marked as ended' });
    });
    it('throws InternalServerError on failure', async () => {
      req.params.id = '42';
      db.query.mockRejectedValue(new Error());
      await expect(endPrescription(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe('getPrescriptionsByDoctor', () => {
    beforeEach(() => {
      req.user.userId = 9;
    });

    it('throws NotFoundError if doctor missing', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(getPrescriptionsByDoctor(req, res)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('returns rows on success', async () => {
      const sample = [
        {
          id: 1,
          drug_name: 'X',
          patient_name: 'P',
          dosage: 'd',
          instructions: 'i',
          prescribed_at: 't',
          end_date: null,
        },
      ];
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 3 }] }) // doctor id
        .mockResolvedValueOnce({ rows: sample });
      await getPrescriptionsByDoctor(req, res);
      expect(res.json).toHaveBeenCalledWith(sample);
    });

    it('wraps errors', async () => {
      db.query.mockRejectedValue(new Error());
      await expect(getPrescriptionsByDoctor(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe('getPrescriptionsForPatient', () => {
    it('splits active vs history and returns them', async () => {
      req.user.userId = 8;
      const now = new Date();
      const past = new Date(now.getTime() - 1000).toISOString();
      const future = new Date(now.getTime() + 100000).toISOString();
      const rows = [
        {
          id: 1,
          name: 'A',
          doctor: 'D',
          dosage: '',
          instructions: '',
          prescribed_at: now.toISOString(),
          end_date: past,
        },
        {
          id: 2,
          name: 'B',
          doctor: 'D2',
          dosage: '',
          instructions: '',
          prescribed_at: now.toISOString(),
          end_date: future,
        },
      ];
      db.query.mockResolvedValue({ rows });
      await getPrescriptionsForPatient(req, res);
      expect(res.json).toHaveBeenCalledWith({
        active: [rows[1]],
        history: [rows[0]],
      });
    });

    it('throws on DB error', async () => {
      db.query.mockRejectedValue(new Error());
      await expect(getPrescriptionsForPatient(req, res)).rejects.toBeInstanceOf(
        InternalServerError
      );
    });
  });
});
