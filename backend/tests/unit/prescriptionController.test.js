const db = require('../../src/db');
jest.mock('../../src/db');
jest.mock('../../src/controllers/activityLogController', () => ({
  logActivity: jest.fn(),
}));
const { logActivity } = require('../../src/controllers/activityLogController');

const {
  BadRequestError,
  NotFoundError,
  InternalServerError,
  AppError,
} = require('../../src/utils/errors');

const {
  addPrescription,
  endPrescription,
  getPrescriptionsByDoctor,
  getPrescriptionsForPatient,
} = require('../../src/controllers/prescriptionController');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date('2025-04-25T12:00:00Z'));
});

describe('addPrescription', () => {
  it('returns 400 when missing fields', async () => {
    const res = mockResponse();
    await addPrescription({ body: {}, user: { userId: 1, role: 'doctor' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required.' });
  });

  it('returns 400 when doctor not found', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = mockResponse();
    await addPrescription(
      {
        body: { patientName: 'n', patientDob: 'd', patientId: 'i', drugName: 'x', dosage: '1' },
        user: { userId: 2, role: 'doctor' },
      },
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Doctor not found' });
  });

  it('returns 404 when drug not found', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 5 }] }) // doctor found
      .mockResolvedValueOnce({ rows: [] }); // drug not found
    const res = mockResponse();
    await addPrescription(
      {
        body: { patientName: 'n', patientDob: 'd', patientId: 'i', drugName: 'x', dosage: '1' },
        user: { userId: 3, role: 'doctor' },
      },
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Drug not found' });
  });

  it('returns 404 when patient not found', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 5 }] }) // doctor
      .mockResolvedValueOnce({ rows: [{ id: 6 }] }) // drug
      .mockResolvedValueOnce({ rows: [] }); // patient
    const res = mockResponse();
    await addPrescription(
      {
        body: { patientName: 'n', patientDob: 'd', patientId: 'i', drugName: 'x', dosage: '1' },
        user: { userId: 4, role: 'doctor' },
      },
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Patient not found' });
  });

  it('inserts and logs on success', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 7 }] }) // doctor
      .mockResolvedValueOnce({ rows: [{ id: 8 }] }) // drug
      .mockResolvedValueOnce({ rows: [{ id: 9 }] }) // patient
      .mockResolvedValueOnce({}); // insert
    const req = {
      body: {
        patientName: 'n',
        patientDob: 'd',
        patientId: 'i',
        drugName: 'x',
        dosage: '1',
        instructions: 'ins',
        endDate: null,
      },
      user: { userId: 5, role: 'doctor' },
    };
    const res = mockResponse();
    await addPrescription(req, res);

    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO prescriptions'), [
      9,
      7,
      8,
      '1',
      'ins',
      null,
    ]);
    expect(logActivity).toHaveBeenCalledWith(5, 'doctor', 'Prescribed x to n');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Prescription added successfully' });
  });

  it('handles AppError thrown inside', async () => {
    const req = {
      body: {
        patientName: 'P',
        patientDob: 'd',
        patientId: 'i',
        drugName: 'x',
        dosage: '1',
        instructions: 'ins',
        endDate: null,
      },
      user: { userId: 6, role: 'doctor' },
    };
    const res = mockResponse();
    db.query.mockResolvedValueOnce({ rows: [{ id: 10 }] }); // doctor
    db.query.mockImplementationOnce(() => {
      throw new AppError('Custom', 418);
    });

    await addPrescription(req, res);
    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith({ message: 'Custom' });
  });

  it('handles unexpected error with 500', async () => {
    const req = {
      body: {
        patientName: 'P',
        patientDob: 'd',
        patientId: 'i',
        drugName: 'x',
        dosage: '1',
        instructions: 'ins',
        endDate: null,
      },
      user: { userId: 7, role: 'doctor' },
    };
    const res = mockResponse();
    db.query.mockResolvedValueOnce({ rows: [{ id: 11 }] }); // doctor
    db.query.mockImplementationOnce(() => {
      throw new Error('boom');
    });

    await addPrescription(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error adding prescription' });
  });
});

describe('endPrescription', () => {
  it('returns 404 when none updated', async () => {
    db.query.mockResolvedValue({ rowCount: 0 });
    const res = mockResponse();
    await endPrescription({ params: { id: '1' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Prescription not found' });
  });

  it('returns message when updated', async () => {
    db.query.mockResolvedValue({ rowCount: 1 });
    const res = mockResponse();
    await endPrescription({ params: { id: '2' } }, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Prescription marked as ended' });
  });

  it('handles unexpected error with 500', async () => {
    db.query.mockImplementation(() => {
      throw new Error('fail');
    });
    const res = mockResponse();
    await endPrescription({ params: { id: '3' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal server error while ending prescription',
    });
  });

  it('handles AppError with its status', async () => {
    db.query.mockImplementation(() => {
      throw new AppError('Nope', 451);
    });
    const res = mockResponse();
    await endPrescription({ params: { id: '4' } }, res);
    expect(res.status).toHaveBeenCalledWith(451);
    expect(res.json).toHaveBeenCalledWith({ message: 'Nope' });
  });
});

describe('getPrescriptionsByDoctor', () => {
  it('returns 404 when doctor not found', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = mockResponse();
    await getPrescriptionsByDoctor({ user: { userId: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Doctor not found' });
  });

  it('returns rows on success', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 2 }] })
      .mockResolvedValueOnce({ rows: [{ id: 3 }] });
    const res = mockResponse();
    await getPrescriptionsByDoctor({ user: { userId: 2 } }, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 3 }]);
  });

  it('handles AppError', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 4 }] });
    db.query.mockImplementationOnce(() => {
      throw new AppError('No access', 403);
    });
    const res = mockResponse();
    await getPrescriptionsByDoctor({ user: { userId: 3 } }, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'No access' });
  });

  it('handles unexpected error with 500', async () => {
    db.query.mockImplementation(() => {
      throw new Error('oops');
    });
    const res = mockResponse();
    await getPrescriptionsByDoctor({ user: { userId: 4 } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Doctor Prescription Fetch Error' });
  });
});

describe('getPrescriptionsForPatient', () => {
  it('returns active and history correctly', async () => {
    const now = new Date();
    const past = new Date(now.getTime() - 86400000).toISOString();
    const future = new Date(now.getTime() + 86400000).toISOString();
    db.query.mockResolvedValue({
      rows: [
        { id: 1, end_date: null },
        { id: 2, end_date: past },
        { id: 3, end_date: future },
      ],
    });
    const res = mockResponse();
    await getPrescriptionsForPatient({ user: { userId: 3 } }, res);
    expect(res.json).toHaveBeenCalledWith({
      active: [
        { id: 1, end_date: null },
        { id: 3, end_date: future },
      ],
      history: [{ id: 2, end_date: past }],
    });
  });

  it('handles AppError', async () => {
    db.query.mockImplementation(() => {
      throw new AppError('Bad', 422);
    });
    const res = mockResponse();
    await getPrescriptionsForPatient({ user: { userId: 5 } }, res);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: 'Bad' });
  });

  it('handles unexpected error with 500', async () => {
    db.query.mockImplementation(() => {
      throw new Error('fail');
    });
    const res = mockResponse();
    await getPrescriptionsForPatient({ user: { userId: 6 } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Fetch Prescription Error' });
  });
});
