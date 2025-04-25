const db = require('../../src/db');
jest.mock('../../src/db');
const {
  InternalServerError,
  NotFoundError,
  BadRequestError,
  AppError,
} = require('../../src/utils/errors');
const {
  generateRoomId,
  getDoctorsForPatient,
  getChattedDoctorUserIds,
  getPatientsForDoctor,
  getChattedPatientUserIds,
  getChatMessages,
  getUnreadMessages,
} = require('../../src/controllers/chatController');

function mockResponse() {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  return res;
}
beforeEach(() => {
  jest.clearAllMocks();
});
describe('generateRoomId', () => {
  it('returns sorted ids string', () => {
    expect(generateRoomId('5', '2')).toBe('2-5');
  });
});
describe('getDoctorsForPatient', () => {
  it('returns rows on success', async () => {
    const rows = [{ doctor_id: 1 }];
    db.query.mockResolvedValue({ rows });
    const res = mockResponse();
    await getDoctorsForPatient({}, res);
    expect(res.json).toHaveBeenCalledWith(rows);
  });
  it('throws InternalServerError on generic error', async () => {
    db.query.mockRejectedValue(new Error());
    await expect(getDoctorsForPatient({}, mockResponse())).rejects.toBeInstanceOf(
      InternalServerError
    );
  });
});
describe('getChattedDoctorUserIds', () => {
  it('returns array of ids', async () => {
    db.query.mockResolvedValue({ rows: [{ doctor_user_id: 3 }, { doctor_user_id: 4 }] });
    const res = mockResponse();
    await getChattedDoctorUserIds({ user: { userId: 1 } }, res);
    expect(res.json).toHaveBeenCalledWith([3, 4]);
  });
});
describe('getPatientsForDoctor', () => {
  it('throws NotFoundError when doctor missing', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    await expect(
      getPatientsForDoctor({ user: { userId: 1 } }, mockResponse())
    ).rejects.toBeInstanceOf(NotFoundError);
  });
  it('returns rows on success', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 2 }] })
      .mockResolvedValueOnce({ rows: [{ patient_id: 5 }] });
    const res = mockResponse();
    await getPatientsForDoctor({ user: { userId: 1 } }, res);
    expect(res.json).toHaveBeenCalledWith([{ patient_id: 5 }]);
  });
});
describe('getChattedPatientUserIds', () => {
  it('returns array of ids', async () => {
    db.query.mockResolvedValue({ rows: [{ patient_user_id: 6 }, { patient_user_id: 7 }] });
    const res = mockResponse();
    await getChattedPatientUserIds({ user: { userId: 1 } }, res);
    expect(res.json).toHaveBeenCalledWith([6, 7]);
  });
});
describe('getChatMessages', () => {
  it('returns rows on success', async () => {
    const rows = [{ message: 'hi' }];
    db.query.mockResolvedValue({ rows });
    const res = mockResponse();
    await getChatMessages({ params: { roomId: 'r1' } }, res);
    expect(res.json).toHaveBeenCalledWith(rows);
  });
});
describe('getUnreadMessages', () => {
  it('throws BadRequestError when missing userId', async () => {
    await expect(getUnreadMessages({ query: {} }, mockResponse())).rejects.toBeInstanceOf(
      BadRequestError
    );
  });
  it('returns map on success', async () => {
    db.query.mockResolvedValue({ rows: [{ room_id: 'r1', unread_count: '2' }] });
    const res = mockResponse();
    await getUnreadMessages({ query: { userId: '1' } }, res);
    expect(res.json).toHaveBeenCalledWith({ r1: 2 });
  });
  it('throws InternalServerError on generic error', async () => {
    db.query.mockRejectedValue(new Error());
    await expect(
      getUnreadMessages({ query: { userId: '1' } }, mockResponse())
    ).rejects.toBeInstanceOf(InternalServerError);
  });
});
