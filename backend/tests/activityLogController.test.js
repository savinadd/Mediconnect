// tests/activityController.test.js
const db = require('../db');
jest.mock('../db');

const { InternalServerError, AppError } = require('../utils/errors');
const { logActivity, getRecentActivities } = require('../controllers/activityController');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('activityController.logActivity', () => {
  it('inserts a new activity record', async () => {
    db.query.mockResolvedValue();
    await logActivity(1, 'user', 'did stuff');
    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO activity_logs (user_id, role, description) VALUES ($1, $2, $3)',
      [1, 'user', 'did stuff']
    );
  });
});

describe('activityController.getRecentActivities', () => {
  it('returns rows on success', async () => {
    const rows = [{ description: 'x', created_at: 'now' }];
    db.query.mockResolvedValue({ rows });
    const req = { user: { userId: 7, role: 'admin' } };
    const res = mockResponse();

    await getRecentActivities(req, res);
    expect(db.query).toHaveBeenCalledWith(expect.any(String), [7, 'admin']);
    expect(res.json).toHaveBeenCalledWith(rows);
  });

  it('throws InternalServerError on generic error', async () => {
    db.query.mockRejectedValue(new Error('fail'));
    await expect(
      getRecentActivities({ user: { userId: 1, role: 'r' } }, mockResponse())
    ).rejects.toBeInstanceOf(InternalServerError);
  });

  it('propagates AppError', async () => {
    const err = new AppError('app error');
    db.query.mockRejectedValue(err);
    await expect(
      getRecentActivities({ user: { userId: 1, role: 'r' } }, mockResponse())
    ).rejects.toBe(err);
  });
});
