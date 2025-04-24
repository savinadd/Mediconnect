// tests/adminController.test.js
const db = require('../db');
jest.mock('../db');

const { InternalServerError, AppError } = require('../utils/errors');
const {
  getAdminSummary,
  getAllUsers,
  getDoctors,
  getPatients,
  getAdmins,
  deleteUser,
} = require('../controllers/adminController');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('adminController.getAdminSummary', () => {
  it('responds with parsed counts', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ count: '10' }] })
      .mockResolvedValueOnce({ rows: [{ count: '2' }] })
      .mockResolvedValueOnce({ rows: [{ count: '3' }] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const res = mockResponse();
    await getAdminSummary({}, res);
    expect(res.json).toHaveBeenCalledWith({
      totalUsers: 10,
      totalDoctors: 2,
      totalPatients: 3,
      totalAdmins: 1,
    });
  });

  it('throws InternalServerError on db failure', async () => {
    db.query.mockRejectedValue(new Error('oops'));
    await expect(getAdminSummary({}, mockResponse())).rejects.toBeInstanceOf(InternalServerError);
  });
});

describe('adminController.deleteUser', () => {
  it('deletes a doctor when found', async () => {
    // patients empty, doctors found, admins empty, then delete
    db.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 5 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({});

    const req = { params: { userId: '5' } };
    const res = mockResponse();
    await deleteUser(req, res);

    expect(db.query).toHaveBeenCalledWith('DELETE FROM doctors WHERE id = $1', ['5']);
    expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
  });

  it('throws InternalServerError if no record exists', async () => {
    db.query
      .mockResolvedValue({ rows: [] })
      .mockResolvedValue({ rows: [] })
      .mockResolvedValue({ rows: [] });

    await expect(deleteUser({ params: { userId: '99' } }, mockResponse())).rejects.toBeInstanceOf(
      InternalServerError
    );
  });
});
