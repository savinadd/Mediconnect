const request = require('supertest');
const app = require('../../server');
const db = require('../../src/db');

describe('Appointment scheduling flow', () => {
  let patientAgent, doctorAgent, patientUser, doctorUser, availSlotId, appointmentId;

  beforeAll(async () => {
    patientAgent = request.agent(app);
    doctorAgent = request.agent(app);

    await doctorAgent
      .post('/api/auth/register')
      .send({ email: 'doc@example.com', password: 'D0cP@ss!', role: 'doctor' });
    await doctorAgent
      .post('/api/auth/login')
      .send({ email: 'doc@example.com', password: 'D0cP@ss!' });

    await patientAgent
      .post('/api/auth/register')
      .send({ email: 'pat@example.com', password: 'P@tP@ss!', role: 'patient' });
    await patientAgent
      .post('/api/auth/login')
      .send({ email: 'pat@example.com', password: 'P@tP@ss!' });
  });

  afterAll(async () => {
    await db.query(
      "DELETE FROM appointments WHERE patient_id IN (SELECT id FROM patients WHERE user_id=(SELECT id FROM users WHERE email='pat@example.com'))"
    );
    await db.query(
      "DELETE FROM doctor_availability WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id=(SELECT id FROM users WHERE email='doc@example.com'))"
    );
    await db.query(
      "DELETE FROM patients WHERE user_id=(SELECT id FROM users WHERE email='pat@example.com')"
    );
    await db.query(
      "DELETE FROM doctors  WHERE user_id=(SELECT id FROM users WHERE email='doc@example.com')"
    );
    await db.query("DELETE FROM users    WHERE email IN ('pat@example.com','doc@example.com')");
    await db.end();
  });

  it('doctor can create an availability slot', async () => {
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 3600_000);
    const res = await doctorAgent
      .post('/api/appointments/availability')
      .send({ startTime: now.toISOString(), endTime: inOneHour.toISOString() });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: 'Availability added' });

    const list = await doctorAgent.get('/api/appointments/availability/my');
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThan(0);
    availSlotId = list.body[0].id;
  });

  it('patient can browse and book that slot', async () => {
    const avail = await patientAgent.get('/api/appointments/availability');
    expect(avail.status).toBe(200);
    expect(avail.body.some(a => a.id === availSlotId)).toBe(true);

    const bookRes = await patientAgent
      .post('/api/appointments/book')
      .send({ availabilityId: availSlotId });
    expect(bookRes.status).toBe(201);
    expect(bookRes.body).toEqual({ message: 'Appointment requested' });
  });

  it('doctor sees the pending appointment and can approve and then cancel it', async () => {
    const reqs = await doctorAgent.get('/api/appointments/appointments/my');
    expect(reqs.status).toBe(200);
    expect(reqs.body.length).toBeGreaterThan(0);
    appointmentId = reqs.body[0].id;
    expect(reqs.body[0].status).toBe('pending');

    const ap = await doctorAgent.put(`/api/appointments/${appointmentId}/approve`);
    expect(ap.status).toBe(200);
    expect(ap.body).toEqual({ message: 'Appointment approved' });

    const afterApprove = await doctorAgent.get('/api/appointments/appointments/my');
    expect(afterApprove.body.find(r => r.id === appointmentId).status).toBe('confirmed');

    const cancel = await doctorAgent.put(`/api/appointments/${appointmentId}/cancel`);
    expect(cancel.status).toBe(200);
    expect(cancel.body).toEqual({ message: 'Appointment rejected' });

    const afterCancel = await doctorAgent.get('/api/appointments/appointments/my');
    expect(afterCancel.body.find(r => r.id === appointmentId).status).toBe('cancelled');
  });
});
