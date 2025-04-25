const db = require('../../src/db');
jest.mock('../../src/db');
const { InternalServerError, AppError } = require('../../src/utils/errors');
const { searchDrugs, getAllDrugs } = require('../../src/controllers/drugController');
function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}
beforeEach(() => {
  jest.clearAllMocks();
});
describe('searchDrugs', () => {
  it('returns rows on success', async () => {
    const rows = [{ id: 1, name: 'A' }];
    db.query.mockResolvedValue({ rows });
    const req = { query: { query: 'a' } };
    const res = mockResponse();
    await searchDrugs(req, res);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT id, name FROM drugs'), [
      '%a%',
    ]);
    expect(res.json).toHaveBeenCalledWith(rows);
  });
  it('propagates AppError', async () => {
    const err = new AppError('app');
    db.query.mockRejectedValue(err);
    await expect(searchDrugs({ query: { query: 'x' } }, mockResponse())).rejects.toBe(err);
  });
  it('throws InternalServerError on generic error', async () => {
    db.query.mockRejectedValue(new Error());
    await expect(searchDrugs({ query: { query: 'x' } }, mockResponse())).rejects.toBeInstanceOf(
      InternalServerError
    );
  });
});
describe('getAllDrugs', () => {
  it('returns rows on success', async () => {
    const rows = [{ id: 2, name: 'B' }];
    db.query.mockResolvedValue({ rows });
    const res = mockResponse();
    await getAllDrugs({}, res);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT id, name FROM drugs'));
    expect(res.json).toHaveBeenCalledWith(rows);
  });
  it('propagates AppError', async () => {
    const err = new AppError('app');
    db.query.mockRejectedValue(err);
    await expect(getAllDrugs({}, mockResponse())).rejects.toBe(err);
  });
  it('throws InternalServerError on generic error', async () => {
    db.query.mockRejectedValue(new Error());
    await expect(getAllDrugs({}, mockResponse())).rejects.toBeInstanceOf(InternalServerError);
  });
});
