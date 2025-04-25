const db = require('../../src/db');
jest.mock('../../src/db');
const { BadRequestError, InternalServerError, AppError } = require('../../src/utils/errors');
const {
  getUserProfile,
  getAllDoctors,
  getDoctorId,
  getPatientId,
} = require('../../src/controllers/userController');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getUserProfile', () => {
  it('returns incomplete when no userId', async () => {
    const res = mockResponse();
    await getUserProfile({ user: {} }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ profileCompleted: false });
  });

  it('returns incomplete when user not found', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = mockResponse();
    await getUserProfile({ user: { userId: 1, role: 'patient' } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ profileCompleted: false });
  });

  it('returns complete patient profile when rows > 0', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'e@e.com' }] }).mockResolvedValueOnce({
      rows: [
        {
          first_name: 'F',
          last_name: 'L',
          birth_date: 'BD',
          phone: 'P',
          address: 'A',
          blood_type: 'O+',
          height: 'H',
          weight: 'W',
          allergies: 'X',
          government_id: 'GID',
        },
      ],
    });
    const res = mockResponse();
    await getUserProfile({ user: { userId: 1, role: 'patient' } }, res);
    expect(res.json).toHaveBeenCalledWith({
      first_name: 'F',
      last_name: 'L',
      birth_date: 'BD',
      phone: 'P',
      address: 'A',
      blood_type: 'O+',
      height: 'H',
      weight: 'W',
      allergies: 'X',
      government_id: 'GID',
      email: 'e@e.com',
      role: 'patient',
      profileCompleted: true,
      userId: 1,
    });
  });

  it('returns incomplete doctor profile when rows = 0', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 2, email: 'd@d.com' }] })
      .mockResolvedValueOnce({ rows: [] });
    const res = mockResponse();
    await getUserProfile({ user: { userId: 2, role: 'doctor' } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      profileCompleted: false,
      role: 'doctor',
      email: 'd@d.com',
      userId: 2,
    });
  });

  it('returns complete admin profile when rows > 0', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 3, email: 'a@a.com' }] }).mockResolvedValueOnce({
      rows: [{ first_name: 'X', last_name: 'Y', phone: 'Z' }],
    });
    const res = mockResponse();
    await getUserProfile({ user: { userId: 3, role: 'admin' } }, res);
    expect(res.json).toHaveBeenCalledWith({
      first_name: 'X',
      last_name: 'Y',
      phone: 'Z',
      email: 'a@a.com',
      role: 'admin',
      profileCompleted: true,
      userId: 3,
    });
  });

  it('returns incomplete admin profile when rows = 0', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 4, email: 'b@b.com' }] })
      .mockResolvedValueOnce({ rows: [] });
    const res = mockResponse();
    await getUserProfile({ user: { userId: 4, role: 'admin' } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      profileCompleted: false,
      role: 'admin',
      email: 'b@b.com',
      userId: 4,
    });
  });

  it('throws BadRequestError on invalid role', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 5, email: 'e5@e.com' }] });
    await expect(
      getUserProfile({ user: { userId: 5, role: 'invalid' } }, mockResponse())
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws InternalServerError on generic db error', async () => {
    db.query.mockRejectedValue(new Error('db fail'));
    await expect(
      getUserProfile({ user: { userId: 6, role: 'patient' } }, mockResponse())
    ).rejects.toBeInstanceOf(InternalServerError);
  });
});

describe('getAllDoctors', () => {
  it('returns rows on success', async () => {
    const rows = [{ id: 10, first_name: 'A', last_name: 'B' }];
    db.query.mockResolvedValue({ rows });
    const res = mockResponse();
    await getAllDoctors({}, res);
    expect(res.json).toHaveBeenCalledWith(rows);
  });

  it('throws AppError when db throws AppError', async () => {
    const err = new AppError('fail', 418);
    db.query.mockRejectedValue(err);
    await expect(getAllDoctors({}, mockResponse())).rejects.toBe(err);
  });
});

describe('getDoctorId', () => {
  it('returns doctorId on success', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 20 }] });
    const res = mockResponse();
    await getDoctorId({ user: { userId: 7 } }, res);
    expect(res.json).toHaveBeenCalledWith({ doctorId: 20 });
  });

  it('throws AppError when db throws AppError', async () => {
    const err = new AppError('fail', 418);
    db.query.mockRejectedValue(err);
    await expect(getDoctorId({ user: { userId: 7 } }, mockResponse())).rejects.toBe(err);
  });

  it('throws InternalServerError on generic db error', async () => {
    db.query.mockRejectedValue(new Error('oops'));
    await expect(getDoctorId({ user: { userId: 8 } }, mockResponse())).rejects.toBeInstanceOf(
      InternalServerError
    );
  });
});

describe('getPatientId', () => {
  it('returns patientId on success', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 30 }] });
    const res = mockResponse();
    await getPatientId({ user: { userId: 9 } }, res);
    expect(res.json).toHaveBeenCalledWith({ patientId: 30 });
  });

  it('throws AppError when db throws AppError', async () => {
    const err = new AppError('fail', 418);
    db.query.mockRejectedValue(err);
    await expect(getPatientId({ user: { userId: 9 } }, mockResponse())).rejects.toBe(err);
  });

  it('throws InternalServerError on generic db error', async () => {
    db.query.mockRejectedValue(new Error('oops'));
    await expect(getPatientId({ user: { userId: 10 } }, mockResponse())).rejects.toBeInstanceOf(
      InternalServerError
    );
  });
});
