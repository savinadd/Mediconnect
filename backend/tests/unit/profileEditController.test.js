const db = require('../../src/db');
jest.mock('../../src/db');
jest.mock('../../src/schemas/userSchema', () => ({
  patientProfileSchema: { parse: jest.fn() },
  doctorProfileSchema: { parse: jest.fn() },
  adminProfileSchema: { parse: jest.fn() },
}));
jest.mock('../../src/controllers/activityLogController', () => ({ logActivity: jest.fn() }));
const {
  patientProfileSchema,
  doctorProfileSchema,
  adminProfileSchema,
} = require('../../src/schemas/userSchema');
const { logActivity } = require('../../src/controllers/activityLogController');
const { BadRequestError } = require('../../src/utils/errors');
const { editUserProfile } = require('../../src/controllers/profileEditController');
function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}
beforeEach(() => {
  jest.clearAllMocks();
});
describe('editUserProfile', () => {
  it('returns 500 on invalid role', async () => {
    const res = mockResponse();
    await editUserProfile({ user: { role: 'x', userId: 1 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error during profile update' });
  });
  it('updates patient profile', async () => {
    patientProfileSchema.parse.mockReturnValue({
      first_name: 'f',
      last_name: 'l',
      phone: 'p',
      address: 'a',
      birth_date: 'b',
      government_id: 'g',
      blood_type: 'bt',
      height: 'h',
      weight: 'w',
      allergies: 'al',
    });
    const res = mockResponse();
    await editUserProfile({ user: { role: 'patient', userId: 2 }, body: {} }, res);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE patients SET'), [
      'f',
      'l',
      'b',
      'p',
      'a',
      'bt',
      'h',
      'w',
      'al',
      2,
    ]);
    expect(logActivity).toHaveBeenCalledWith(2, 'patient', 'Updated their profile');
    expect(res.json).toHaveBeenCalledWith({ message: 'Profile updated successfully' });
  });
  it('updates doctor profile', async () => {
    doctorProfileSchema.parse.mockReturnValue({
      first_name: 'First Last',
      last_name: '',
      phone: 'p',
      address: 'a',
      specialization: 's',
      license_number: 'ln',
    });
    const res = mockResponse();
    await editUserProfile({ user: { role: 'doctor', userId: 3 }, body: {} }, res);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE doctors SET'), [
      'First',
      'Last',
      'p',
      'a',
      's',
      'ln',
      3,
    ]);
    expect(logActivity).toHaveBeenCalledWith(3, 'doctor', 'Updated their profile');
    expect(res.json).toHaveBeenCalledWith({ message: 'Profile updated successfully' });
  });
  it('updates existing admin profile', async () => {
    adminProfileSchema.parse.mockReturnValue({
      first_name: 'f',
      last_name: 'l',
      phone: 'p',
      email: 'e',
    });
    db.query.mockResolvedValueOnce({ rows: [{ id: 4 }] }).mockResolvedValueOnce({});
    const res = mockResponse();
    await editUserProfile({ user: { role: 'admin', userId: 4 }, body: {} }, res);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE admins SET'), [
      'f',
      'l',
      'p',
      'e',
      4,
    ]);
    expect(logActivity).toHaveBeenCalledWith(4, 'admin', 'Updated their profile');
    expect(res.json).toHaveBeenCalledWith({ message: 'Profile updated successfully' });
  });
  it('inserts new admin profile', async () => {
    adminProfileSchema.parse.mockReturnValue({
      first_name: 'f',
      last_name: 'l',
      phone: 'p',
      email: 'e',
    });
    db.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({});
    const res = mockResponse();
    await editUserProfile({ user: { role: 'admin', userId: 5 }, body: {} }, res);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO admins'), [
      5,
      'f',
      'l',
      'p',
      'e',
    ]);
    expect(logActivity).toHaveBeenCalledWith(5, 'admin', 'Updated their profile');
    expect(res.json).toHaveBeenCalledWith({ message: 'Profile updated successfully' });
  });
});
