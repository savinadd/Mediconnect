const db = require('../db');
const { BadRequestError, NotFoundError, InternalServerError } = require('../utils/errors');

async function addAvailability(req, res) {
  const userId = req.user.userId;
  const { startTime, endTime } = req.body;
  if (!startTime || !endTime) throw new BadRequestError('startTime & endTime required');
  const dr = await db.query('SELECT id FROM doctors WHERE user_id=$1', [userId]);
  const doctorId = dr.rows[0]?.id;
  if (!doctorId) throw new NotFoundError('Doctor not found');

  await db.query(
    `INSERT INTO doctor_availability(doctor_id, start_time, end_time)
     VALUES ($1,$2,$3)`,
    [doctorId, startTime, endTime]
  );
  res.status(201).json({ message: 'Availability added' });
}

async function getMyAvailability(req, res) {
  const userId = req.user.userId;
  const dr = await db.query('SELECT id FROM doctors WHERE user_id=$1', [userId]);
  const doctorId = dr.rows[0]?.id;
  if (!doctorId) throw new NotFoundError('Doctor not found');

  const { rows } = await db.query(
    `SELECT id, start_time, end_time
     FROM doctor_availability
     WHERE doctor_id=$1
     ORDER BY start_time`,
    [doctorId]
  );
  res.json(rows);
}

async function getAvailability(req, res) {
  const { doctorId } = req.query;
  const params = [];
  let sql = `
      SELECT
        da.id,
        da.doctor_id,
        d.first_name || ' ' || d.last_name AS doctor_name,
        da.start_time,
        da.end_time
      FROM doctor_availability da
      JOIN doctors d ON da.doctor_id = d.id
      LEFT JOIN appointments a
        ON a.doctor_id  = da.doctor_id
       AND a.start_time = da.start_time
       AND a.end_time   = da.end_time
      WHERE a.id IS NULL
    `;

  if (doctorId) {
    sql += ` AND da.doctor_id = $1`;
    params.push(doctorId);
  }

  sql += ` ORDER BY da.start_time`;

  const result = await db.query(sql, params);
  res.json(result.rows);
}

async function bookAppointment(req, res) {
  const { availabilityId } = req.body;
  if (!availabilityId) throw new BadRequestError('Missing availabilityId in request body');

  const slotResult = await db.query(
    `SELECT doctor_id, start_time, end_time
         FROM doctor_availability
        WHERE id = $1`,
    [availabilityId]
  );
  const slot = slotResult.rows[0];
  if (!slot) throw new NotFoundError('Slot not found');

  const patResult = await db.query(`SELECT id FROM patients WHERE user_id = $1`, [req.user.userId]);
  const patientId = patResult.rows[0]?.id;
  if (!patientId) throw new NotFoundError('Patient not found');

  await db.query(
    `INSERT INTO appointments (patient_id, doctor_id, start_time, end_time)
       VALUES ($1, $2, $3, $4)`,
    [patientId, slot.doctor_id, slot.start_time, slot.end_time]
  );

  res.status(201).json({ message: 'Appointment requested' });
}

async function getMyAppointments(req, res) {
  const userId = req.user.userId;
  const dr = await db.query('SELECT id FROM doctors WHERE user_id=$1', [userId]);
  const doctorId = dr.rows[0]?.id;
  if (!doctorId) throw new NotFoundError('Doctor not found');

  const { rows } = await db.query(
    `SELECT a.id,
            p.user_id AS patient_user_id,
            p.first_name||' '||p.last_name AS patient_name,
            a.start_time, a.end_time, a.status
       FROM appointments a
       JOIN patients p ON a.patient_id=p.id
      WHERE a.doctor_id=$1
      ORDER BY a.start_time`,
    [doctorId]
  );
  res.json(rows);
}

async function approveAppointment(req, res) {
  const { id } = req.params;

  const upd = await db.query(
    `UPDATE appointments
         SET status='confirmed'
       WHERE id=$1
         AND doctor_id=(SELECT id FROM doctors WHERE user_id=$2)
       RETURNING id`,
    [id, req.user.userId]
  );
  if (!upd.rows.length) throw new NotFoundError('Appointment not found');
  res.json({ message: 'Appointment approved' });
}

async function cancelAppointment(req, res) {
  const { id } = req.params;
  const { userId, role } = req.user;

  if (role === 'patient') {
    const pat = await db.query('SELECT id FROM patients WHERE user_id = $1', [userId]);
    const patientId = pat.rows[0]?.id;
    if (!patientId) throw new NotFoundError('Patient not found');

    const del = await db.query(
      `DELETE FROM appointments
         WHERE id = $1
           AND patient_id = $2
       RETURNING id`,
      [id, patientId]
    );
    if (!del.rows.length) throw new InternalServerError('Cannot cancel that appointment');
    return res.json({ message: 'Appointment cancelled' });
  }

  const upd = await db.query(
    `UPDATE appointments
         SET status = 'cancelled'
       WHERE id = $1
         AND doctor_id = (SELECT id FROM doctors WHERE user_id = $2)
       RETURNING id`,
    [id, userId]
  );
  if (!upd.rows.length) throw new NotFoundError('Appointment not found or not yours to cancel');
  return res.json({ message: 'Appointment cancelled' });
}

async function getMyPatientAppointments(req, res) {
  const userId = req.user.userId;
  const p = await db.query('SELECT id FROM patients WHERE user_id=$1', [userId]);
  const patientId = p.rows[0]?.id;
  if (!patientId) throw new NotFoundError('Patient not found');

  const { rows } = await db.query(
    `SELECT a.id,
              doc.id   AS doctor_id,
              doc.first_name||' '||doc.last_name AS doctor_name,
              a.start_time, a.end_time, a.status
         FROM appointments a
         JOIN doctors doc ON a.doctor_id=doc.id
        WHERE a.patient_id=$1
        ORDER BY a.start_time`,
    [patientId]
  );
  res.json(rows);
}

async function deleteAvailability(req, res) {
  const doctorUserId = req.user.userId;
  const slotId = req.params.id;

  const upd = await db.query(
    `DELETE FROM doctor_availability
         WHERE id = $1
           AND doctor_id = (SELECT id FROM doctors WHERE user_id = $2)
         RETURNING id`,
    [slotId, doctorUserId]
  );
  if (!upd.rows.length) throw new NotFoundError('Availability slot not found or not owned by you');
  res.json({ message: 'Availability deleted' });
}

module.exports = {
  addAvailability,
  getMyAvailability,
  getAvailability,
  bookAppointment,
  getMyAppointments,
  approveAppointment,
  cancelAppointment,
  getMyPatientAppointments,
  deleteAvailability,
};
