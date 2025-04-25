const db = require('../db');
const { InternalServerError, AppError } = require('../utils/errors');
const logger = require('../utils/logger.js');

const getAdminSummary = async (req, res) => {
  try {
    const users = await db.query('SELECT COUNT(*) FROM users');
    const doctors = await db.query('SELECT COUNT(*) FROM doctors');
    const patients = await db.query('SELECT COUNT(*) FROM patients');
    const admins = await db.query('SELECT COUNT(*) FROM admins');

    res.json({
      totalUsers: parseInt(users.rows[0].count, 10),
      totalDoctors: parseInt(doctors.rows[0].count, 10),
      totalPatients: parseInt(patients.rows[0].count, 10),
      totalAdmins: parseInt(admins.rows[0].count, 10),
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError('Failed to fetch administrator summary');
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError('Failed to fetch users');
  }
};

const getDoctors = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        doctors.id,
        users.email,
        doctors.first_name,
        doctors.last_name,
        doctors.specialization,
        users.created_at
      FROM doctors
      JOIN users ON doctors.user_id = users.id
      ORDER BY users.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError('Failed to fetch all doctors');
  }
};

const getPatients = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        patients.id,
        users.email,
        patients.first_name,
        patients.last_name,
        patients.blood_type,
        users.created_at
      FROM patients
      JOIN users ON patients.user_id = users.id
      ORDER BY users.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError('Failed to fetch patients');
  }
};

const getAdmins = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        admins.id,
        users.email,
        admins.first_name,
        admins.last_name,
        admins.phone,
        users.created_at
      FROM admins
      JOIN users ON admins.user_id = users.id
      ORDER BY users.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError('Failed to fetch admins');
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  logger.warn('Delete request received for user ID:', userId);

  try {
    const [pat, doc, adm] = await Promise.all([
      db.query('SELECT * FROM patients WHERE id = $1', [userId]),
      db.query('SELECT * FROM doctors  WHERE id = $1', [userId]),
      db.query('SELECT * FROM admins   WHERE id = $1', [userId]),
    ]);

    if (pat.rows.length === 0 && doc.rows.length === 0 && adm.rows.length === 0) {
      throw new InternalServerError('User not found for deletion');
    }

    if (pat.rows.length > 0) {
      await db.query('DELETE FROM patients WHERE id = $1', [userId]);
    } else if (doc.rows.length > 0) {
      await db.query('DELETE FROM doctors WHERE id = $1', [userId]);
    } else {
      await db.query('DELETE FROM admins WHERE id = $1', [userId]);
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError('Failed to delete user');
  }
};

module.exports = {
  getAdminSummary,
  getAllUsers,
  getDoctors,
  getPatients,
  getAdmins,
  deleteUser,
};
