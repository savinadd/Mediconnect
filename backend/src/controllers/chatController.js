const db = require("../db");
const { InternalServerError, NotFoundError, BadRequestError, AppError } = require("../utils/errors");

const generateRoomId = (a, b) => {
  const [x, y] = [Number(a), Number(b)].sort((u, v) => u - v);
  return `${x}-${y}`;
};

async function getDoctorsForPatient(req, res) {
  try {
    const result = await db.query(`
      SELECT 
        d.id        AS doctor_id,
        u.id        AS user_id,
        d.first_name, d.last_name,
        d.specialization, d.address
      FROM doctors d
      JOIN users u ON d.user_id = u.id
    `);
    res.json(result.rows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError("Server error upon fetching doctors")
  }
}

async function getChattedDoctorUserIds(req, res) {
  const patientUserId = req.user.userId;
  try {
    const result = await db.query(`
      SELECT DISTINCT receiver_id AS doctor_user_id
      FROM chat_messages
      WHERE sender_id = $1 AND sender_role = 'patient'
    `, [patientUserId]);
    res.json(result.rows.map(r => r.doctor_user_id));
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError();
  }
}

async function getPatientsForDoctor(req, res) {
  const doctorUserId = req.user.userId;

  try {
    const d = await db.query(
      `SELECT id FROM doctors WHERE user_id = $1`,
      [doctorUserId]
    );
    if (!d.rows.length) {
      throw new NotFoundError("Doctor not found");
    }
    const doctorId = d.rows[0].id;

    const result = await db.query(`
      WITH contacts AS (
        SELECT pr.patient_id AS patient_user_id
        FROM prescriptions pr
        WHERE pr.doctor_id = $1

        UNION

        SELECT cm.sender_id AS patient_user_id
        FROM chat_messages cm
        WHERE cm.sender_role = 'patient'
          AND cm.receiver_id = $2

        UNION

        SELECT cm.receiver_id AS patient_user_id
        FROM chat_messages cm
        WHERE cm.sender_role = 'doctor'
          AND cm.sender_id = $2
      )
      SELECT DISTINCT
        p.id                               AS patient_id,
        u.id                               AS user_id,
        p.first_name || ' ' || p.last_name AS patient_name
      FROM contacts c
      JOIN patients p ON p.user_id = c.patient_user_id
      JOIN users    u ON u.id       = c.patient_user_id
    `, [doctorId, doctorUserId]);

    res.json(result.rows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError();
  }
}

async function getChattedPatientUserIds(req, res) {
  const doctorUserId = req.user.userId;
  try {
    const result = await db.query(`
      SELECT DISTINCT
        CASE WHEN sender_role='doctor' THEN receiver_id
             ELSE sender_id
        END AS patient_user_id
      FROM chat_messages
      WHERE sender_id = $1 OR receiver_id = $1
    `, [doctorUserId]);
    res.json(result.rows.map(r => r.patient_user_id));
  } catch (err) {
    if (err instanceof AppError) throw err;
   throw new InternalServerError();
  }
}


async function getChatMessages(req, res) {
  const { roomId } = req.params;
  try {
    const result = await db.query(
      `SELECT sender_id, receiver_id, sender_role, message, timestamp
       FROM chat_messages
       WHERE room_id = $1
       ORDER BY timestamp ASC`,
      [roomId]
    );
    res.json(result.rows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError();
  }
}

async function getUnreadMessages(req, res) {
  const userId = Number(req.query.userId);
  if (!userId) throw new BadRequestError("Missing userId");

  try {
    const result = await db.query(
      `SELECT room_id, COUNT(*) AS unread_count
       FROM chat_messages
       WHERE receiver_id = $1 AND is_read = false
       GROUP BY room_id`,
      [userId]
    );
    const map = {};
    result.rows.forEach(r => (map[r.room_id] = Number(r.unread_count)));
    res.json(map);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError();
  }
}

module.exports = {
  getDoctorsForPatient,
  getChattedDoctorUserIds,
  getPatientsForDoctor,
  getChattedPatientUserIds,
  getChatMessages,
  getUnreadMessages
};
