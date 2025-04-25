const db = require('../../src/db');
jest.mock('../../src/db');
const { logActivity } = require('../../src/controllers/activityLogController');
jest.mock('../../src/controllers/activityLogController');
const { BadRequestError, NotFoundError, InternalServerError } = require('../../src/utils/errors');
const { symptomSchema } = require('../../src/schemas/symptomSchema');
jest.mock('../../src/schemas/symptomSchema');
const {
  addPatientSymptom,
  getPatientSymptomHistory,
} = require('../../src/controllers/symptomController');
function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}
beforeEach(() => {
  jest.clearAllMocks();
});
describe('addPatientSymptom', () => {
  it('throws BadRequestError on invalid input', async () => {
    symptomSchema.safeParse = jest
      .fn()
      .mockReturnValue({ success: false, error: { errors: [{ message: 'm' }] } });
    await expect(addPatientSymptom({ body: {} }, mockResponse())).rejects.toBeInstanceOf(
      BadRequestError
    );
  });
  it('throws NotFoundError when patient missing', async () => {
    symptomSchema.safeParse = jest.fn().mockReturnValue({
      success: true,
      data: { symptomName: 's', description: 'd', severity: 'sev', duration: 'dur', notes: 'n' },
    });
    db.query.mockResolvedValueOnce({ rows: [] });
    await expect(
      addPatientSymptom({ body: {}, user: { userId: 1, role: 'patient' } }, mockResponse())
    ).rejects.toBeInstanceOf(NotFoundError);
  });
  it('logs existing symptom', async () => {
    symptomSchema.safeParse = jest.fn().mockReturnValue({
      success: true,
      data: { name: 'sym', description: 'd', severity: null, duration: null, notes: null },
    });
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 2 }] })
      .mockResolvedValueOnce({ rows: [{ id: 3 }] })
      .mockResolvedValueOnce({});
    const req = { body: {}, user: { userId: 1, role: 'patient' } };
    const res = mockResponse();
    await addPatientSymptom(req, res);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO patient_symptoms'), [
      2,
      3,
      null,
      null,
      null,
    ]);
    expect(logActivity).toHaveBeenCalledWith(1, 'patient', 'Logged symptom: sym');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Symptom logged successfully' });
  });
});
describe('getPatientSymptomHistory', () => {
  it('throws NotFoundError when patient missing', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    await expect(
      getPatientSymptomHistory({ user: { userId: 1 } }, mockResponse())
    ).rejects.toBeInstanceOf(NotFoundError);
  });
  it('returns history rows', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 2 }] }).mockResolvedValueOnce({
      rows: [{ logged_at: 't', symptom_name: 's', severity: 'sev', duration: 'dur', notes: 'n' }],
    });
    const res = mockResponse();
    await getPatientSymptomHistory({ user: { userId: 1 } }, res);
    expect(res.json).toHaveBeenCalledWith([
      { logged_at: 't', symptom_name: 's', severity: 'sev', duration: 'dur', notes: 'n' },
    ]);
  });
});
