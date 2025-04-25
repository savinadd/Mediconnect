const db = require('../../src/db');
jest.mock('../../src/db');

const {
  addAvailability,
  getMyAvailability,
  getAvailability,
  bookAppointment,
  getMyAppointments,
  approveAppointment,
  cancelAppointment,
  getMyPatientAppointments,
  deleteAvailability,
} = require('../../src/controllers/appointmentController');

const { BadRequestError, NotFoundError, InternalServerError } = require('../../src/utils/errors');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('appointmentController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addAvailability', () => {
    it('throws BadRequestError when missing times', async () => {
      await expect(
        addAvailability({ user: { userId: 1 }, body: {} }, mockResponse())
      ).rejects.toBeInstanceOf(BadRequestError);
    });

    it('throws NotFoundError when doctor not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] }); // SELECT id FROM doctors
      await expect(
        addAvailability(
          { user: { userId: 2 }, body: { startTime: '9', endTime: '10' } },
          mockResponse()
        )
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('inserts availability and returns 201', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 3 }] }) // doctor lookup
        .mockResolvedValueOnce({}); // INSERT
      const req = { user: { userId: 2 }, body: { startTime: '9', endTime: '10' } };
      const res = mockResponse();
      await addAvailability(req, res);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO doctor_availability'),
        [3, '9', '10']
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Availability added' });
    });
  });

  describe('getMyAvailability', () => {
    it('throws NotFoundError when doctor not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(
        getMyAvailability({ user: { userId: 1 } }, mockResponse())
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('returns rows when found', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 4 }] }) // doctor lookup
        .mockResolvedValueOnce({ rows: [{ id: 5 }] }); // availability lookup
      const res = mockResponse();
      await getMyAvailability({ user: { userId: 1 } }, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 5 }]);
    });
  });

  describe('getAvailability', () => {
    it('returns all slots when no doctorId', async () => {
      const rows = [{ id: 6 }];
      db.query.mockResolvedValue({ rows });
      const res = mockResponse();
      await getAvailability({ query: {} }, res);
      expect(res.json).toHaveBeenCalledWith(rows);
      expect(db.query).toHaveBeenCalledWith(expect.any(String), []);
    });

    it('filters by doctorId when provided', async () => {
      const rows = [{ id: 7 }];
      db.query.mockResolvedValue({ rows });
      const res = mockResponse();
      await getAvailability({ query: { doctorId: '8' } }, res);
      expect(res.json).toHaveBeenCalledWith(rows);
      expect(db.query).toHaveBeenCalledWith(expect.any(String), ['8']);
    });
  });

  describe('bookAppointment', () => {
    it('throws BadRequestError when missing availabilityId', async () => {
      await expect(
        bookAppointment({ user: { userId: 1 }, body: {} }, mockResponse())
      ).rejects.toBeInstanceOf(BadRequestError);
    });

    it('throws NotFoundError when slot not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] }); // slot lookup
      await expect(
        bookAppointment({ user: { userId: 1 }, body: { availabilityId: 9 } }, mockResponse())
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('throws NotFoundError when patient not found', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ doctor_id: 1, start_time: 's', end_time: 'e' }] }) // slot
        .mockResolvedValueOnce({ rows: [] }); // patient
      await expect(
        bookAppointment({ user: { userId: 2 }, body: { availabilityId: 10 } }, mockResponse())
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('inserts appointment and returns 201', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ doctor_id: 1, start_time: 's', end_time: 'e' }] })
        .mockResolvedValueOnce({ rows: [{ id: 3 }] })
        .mockResolvedValueOnce({});
      const req = { user: { userId: 2 }, body: { availabilityId: 10 } };
      const res = mockResponse();
      await bookAppointment(req, res);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO appointments'), [
        3,
        1,
        's',
        'e',
      ]);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Appointment requested' });
    });
  });

  describe('getMyAppointments', () => {
    it('throws NotFoundError when doctor not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(
        getMyAppointments({ user: { userId: 1 } }, mockResponse())
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('returns rows when found', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 2 }] })
        .mockResolvedValueOnce({ rows: [{ id: 3 }] });
      const res = mockResponse();
      await getMyAppointments({ user: { userId: 1 } }, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 3 }]);
    });
  });

  describe('approveAppointment', () => {
    it('throws NotFoundError when none updated', async () => {
      db.query.mockResolvedValue({ rows: [] });
      await expect(
        approveAppointment({ user: { userId: 1 }, params: { id: '1' } }, mockResponse())
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('returns message when updated', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1 }] });
      const res = mockResponse();
      await approveAppointment({ user: { userId: 1 }, params: { id: '1' } }, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'Appointment approved' });
    });
  });

  describe('cancelAppointment', () => {
    it('patient branch: throws NotFoundError when patient not found', async () => {
      const req = { user: { userId: 1, role: 'patient' }, params: { id: '1' } };
      db.query.mockResolvedValueOnce({ rows: [] }); // patient lookup
      await expect(cancelAppointment(req, mockResponse())).rejects.toBeInstanceOf(NotFoundError);
    });

    it('patient branch: throws InternalServerError when delete returns no rows', async () => {
      const req = { user: { userId: 1, role: 'patient' }, params: { id: '1' } };
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 5 }] }) // patient found
        .mockResolvedValueOnce({ rows: [] }); // delete returned none
      await expect(cancelAppointment(req, mockResponse())).rejects.toBeInstanceOf(
        InternalServerError
      );
    });

    it('patient branch: returns cancelled message', async () => {
      const req = { user: { userId: 1, role: 'patient' }, params: { id: '1' } };
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 5 }] }) // patient found
        .mockResolvedValueOnce({ rows: [{ id: 7 }] }); // delete succeeded
      const res = mockResponse();
      await cancelAppointment(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'Appointment cancelled' });
    });

    it('doctor branch: throws NotFoundError when no rows updated', async () => {
      const req = { user: { userId: 2, role: 'doctor' }, params: { id: '2' } };
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(cancelAppointment(req, mockResponse())).rejects.toBeInstanceOf(NotFoundError);
    });

    it('doctor branch: returns cancelled message', async () => {
      const req = { user: { userId: 2, role: 'doctor' }, params: { id: '2' } };
      db.query.mockResolvedValueOnce({ rows: [{ id: 8 }] });
      const res = mockResponse();
      await cancelAppointment(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'Appointment cancelled' });
    });
  });

  describe('getMyPatientAppointments', () => {
    it('throws NotFoundError when patient not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(
        getMyPatientAppointments({ user: { userId: 1 } }, mockResponse())
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('returns rows when found', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 2 }] })
        .mockResolvedValueOnce({ rows: [{ id: 3 }] });
      const res = mockResponse();
      await getMyPatientAppointments({ user: { userId: 1 } }, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 3 }]);
    });
  });

  describe('deleteAvailability', () => {
    it('throws NotFoundError when none deleted', async () => {
      db.query.mockResolvedValue({ rows: [] });
      await expect(
        deleteAvailability({ user: { userId: 1 }, params: { id: '1' } }, mockResponse())
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('returns message when deleted', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 4 }] });
      const res = mockResponse();
      await deleteAvailability({ user: { userId: 1 }, params: { id: '1' } }, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'Availability deleted' });
    });
  });
});
