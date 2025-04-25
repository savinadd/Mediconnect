const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');
jest.mock('../../src/db');

describe('Drug Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/drugs → 200 returns all drugs', async () => {
    const rows = [{ id: 1, name: 'X' }];
    db.query.mockResolvedValueOnce({ rows });
    const res = await request(app).get('/api/drugs');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
  });

  it('GET /api/drugs/search → 200 returns filtered', async () => {
    const rows = [{ id: 2, name: 'Y' }];
    db.query.mockResolvedValueOnce({ rows });
    const res = await request(app).get('/api/drugs/search').query({ query: 'y' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE name ILIKE'), ['%y%']);
  });
});
