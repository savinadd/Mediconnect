const db = require('../src/db');
const { InternalServerError } = require('../src/utils/errors');
const { searchDrugs, getAllDrugs } = require('../src/controllers/drugController');

jest.mock('../src/db');

describe('Drug Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { query: {} };
    res = { json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('searchDrugs', () => {
    it('returns rows when query succeeds', async () => {
      req.query.query = 'asp';
      const rows = [{ id: 1, name: 'Aspirin' }];
      db.query.mockResolvedValue({ rows });
      await searchDrugs(req, res);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('ILIKE'), ['%asp%']);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it('throws InternalServerError on DB error', async () => {
      req.query.query = 'foo';
      db.query.mockRejectedValue(new Error('boom'));
      await expect(searchDrugs(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe('getAllDrugs', () => {
    it('returns all drugs on success', async () => {
      const rows = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ];
      db.query.mockResolvedValue({ rows });
      await getAllDrugs(req, res);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('ORDER BY name ASC'));
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it('throws InternalServerError on failure', async () => {
      db.query.mockRejectedValue(new Error());
      await expect(getAllDrugs(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });
});
