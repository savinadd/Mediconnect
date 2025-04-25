const db = require('../../src/db');
jest.mock('../../src/db');
const { InternalServerError, AppError } = require('../../src/utils/errors');
const {
  getAdminSummary,
  getAllUsers,
  getDoctors,
  getPatients,
  getAdmins,
  deleteUser,
} = require('../../src/controllers/adminController');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}
beforeEach(() => {
  jest.clearAllMocks();
});
describe('getAdminSummary', () => {
  it('responds with parsed counts', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ count: '4' }] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] })
      .mockResolvedValueOnce({ rows: [{ count: '2' }] })
      .mockResolvedValueOnce({ rows: [{ count: '3' }] });
    const res = mockResponse();
    await getAdminSummary({}, res);
    expect(res.json).toHaveBeenCalledWith({
      totalUsers: 4,
      totalDoctors: 1,
      totalPatients: 2,
      totalAdmins: 3,
    });
  });
  it('throws InternalServerError on generic error', async () => {
    db.query.mockRejectedValue(new Error('db fail'));
    await expect(getAdminSummary({}, mockResponse())).rejects.toBeInstanceOf(InternalServerError);
  });
});
describe('getAllUsers', () => {
  it('returns rows on success', async () => {
    const rows = [{ id: 1 }];
    db.query.mockResolvedValue({ rows });
    const res = mockResponse();
    await getAllUsers({}, res);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT id, email, role'));
    expect(res.json).toHaveBeenCalledWith(rows);
  });
  it('propagates AppError', async () => {
    const err = new AppError('app');
    db.query.mockRejectedValue(err);
    await expect(getAllUsers({}, mockResponse())).rejects.toBe(err);
  });
  it('throws InternalServerError on generic error', async () => {
    db.query.mockRejectedValue(new Error());
    await expect(getAllUsers({}, mockResponse())).rejects.toBeInstanceOf(InternalServerError);
  });
});
describe('getDoctors', () => {
  it('returns rows on success', async () => {
    const rows = [{ id: 2 }];
    db.query.mockResolvedValue({ rows });
    const res = mockResponse();
    await getDoctors({}, res);
    expect(res.json).toHaveBeenCalledWith(rows);
  });
  it('throws InternalServerError on generic error', async () => {
    db.query.mockRejectedValue(new Error());
    await expect(getDoctors({}, mockResponse())).rejects.toBeInstanceOf(InternalServerError);
  });
});
describe('getPatients', () => {
  it('returns rows on success', async () => {
    const rows = [{ id: 3 }];
    db.query.mockResolvedValue({ rows });
    const res = mockResponse();
    await getPatients({}, res);
    expect(res.json).toHaveBeenCalledWith(rows);
  });
  it('throws InternalServerError on generic error', async () => {
    db.query.mockRejectedValue(new Error());
    await expect(getPatients({}, mockResponse())).rejects.toBeInstanceOf(InternalServerError);
  });
});
describe('getAdmins', () => {
  it('returns rows on success', async () => {
    const rows = [{ id: 4 }];
    db.query.mockResolvedValue({ rows });
    const res = mockResponse();
    await getAdmins({}, res);
    expect(res.json).toHaveBeenCalledWith(rows);
  });
  it('throws InternalServerError on generic error', async () => {
    db.query.mockRejectedValue(new Error());
    await expect(getAdmins({}, mockResponse())).rejects.toBeInstanceOf(InternalServerError);
  });
});
describe('deleteUser', () => {
  it('deletes a patient when found', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 5 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({});
    const req = { params: { userId: '5' } };
    const res = mockResponse();
    await deleteUser(req, res);
    expect(db.query).toHaveBeenCalledWith('DELETE FROM patients WHERE id = $1', ['5']);
    expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
  });
  it('deletes a doctor when found', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 6 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({});
    const req = { params: { userId: '6' } };
    const res = mockResponse();
    await deleteUser(req, res);
    expect(db.query).toHaveBeenCalledWith('DELETE FROM doctors WHERE id = $1', ['6']);
    expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
  });
  it('deletes an admin when found', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 7 }] })
      .mockResolvedValueOnce({});
    const req = { params: { userId: '7' } };
    const res = mockResponse();
    await deleteUser(req, res);
    expect(db.query).toHaveBeenCalledWith('DELETE FROM admins WHERE id = $1', ['7']);
    expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
  });
  it('throws InternalServerError if not found', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    await expect(deleteUser({ params: { userId: '99' } }, mockResponse())).rejects.toBeInstanceOf(
      InternalServerError
    );
  });
});
