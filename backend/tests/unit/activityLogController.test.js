const db = require('../../src/db');
jest.mock('../../src/db');
const { InternalServerError, AppError } = require('../../src/utils/errors');
const { logActivity, getRecentActivities } = require('../../src/controllers/activityLogController');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('logActivity', () => {
  it('calls db.query with correct SQL and params', async () => {
    db.query.mockResolvedValue();
    await logActivity(1, 'role', 'desc');
    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO activity_logs (user_id, role, description) VALUES ($1, $2, $3)',
      [1, 'role', 'desc']
    );
  });
});

describe('getRecentActivities', () => {
  it('responds with rows on success', async () => {
    const rows = [{ description: 'd', created_at: 't' }];
    db.query.mockResolvedValue({ rows });
    const req = { user: { userId: 2, role: 'r' } };
    const res = mockResponse();
    await getRecentActivities(req, res);
    expect(db.query).toHaveBeenCalledWith(expect.any(String), [2, 'r']);
    expect(res.json).toHaveBeenCalledWith(rows);
  });

  it('throws AppError if db.query rejects with AppError', async () => {
    const err = new AppError('app');
    db.query.mockRejectedValue(err);
    await expect(
      getRecentActivities({ user: { userId: 3, role: 'x' } }, mockResponse())
    ).rejects.toBe(err);
  });

  it('throws InternalServerError on generic error', async () => {
    db.query.mockRejectedValue(new Error('fail'));
    await expect(
      getRecentActivities({ user: { userId: 4, role: 'y' } }, mockResponse())
    ).rejects.toBeInstanceOf(InternalServerError);
  });
});
