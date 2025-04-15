const db = require("../db");

const getAdminSummary = async (req, res) => {
  try {
    const users = await db.query("SELECT COUNT(*) FROM users");
    const doctors = await db.query("SELECT COUNT(*) FROM doctors");
    const patients = await db.query("SELECT COUNT(*) FROM patients");
    const admins = await db.query("SELECT COUNT(*) FROM admins");

    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalDoctors: parseInt(doctors.rows[0].count),
      totalPatients: parseInt(patients.rows[0].count),
      totalAdmins: parseInt(admins.rows[0].count),
    });
  } catch (err) {
    console.error("Admin summary error:", err);
    res.status(500).json({ message: "Server error fetching summary" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT users.id, users.email, users.role, users.created_at 
      FROM users
      ORDER BY users.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Admin Get Users Error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};const getDoctors = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        doctors.id, 
        users.email, 
        doctors.first_name, 
        doctors.last_name, 
        doctors.specialization, 
        users.created_at AS created_at 
      FROM doctors
      JOIN users ON doctors.user_id = users.id
      ORDER BY users.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({ message: "Failed to fetch doctors", error: err.message });
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
        users.created_at AS created_at 
      FROM patients
      JOIN users ON patients.user_id = users.id
      ORDER BY users.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ message: "Failed to fetch patients", error: err.message });
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
        users.created_at AS created_at 
      FROM admins
      JOIN users ON admins.user_id = users.id
      ORDER BY users.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching admins:", err);
    res.status(500).json({ message: "Failed to fetch admins", error: err.message });
  }
};


const deleteUser = async (req, res) => {
  const { userId } = req.params; 

  console.log('Delete request received for user ID:', userId);

  try {
    const patient = await db.query("SELECT * FROM patients WHERE id = $1", [userId]);
    const doctor = await db.query("SELECT * FROM doctors WHERE id = $1", [userId]);
    const admin = await db.query("SELECT * FROM admins WHERE id = $1", [userId]);

    if (patient.rows.length === 0 && doctor.rows.length === 0 && admin.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    if (patient.rows.length > 0) {
      await db.query("DELETE FROM patients WHERE id = $1", [userId]);
    } else if (doctor.rows.length > 0) {
      await db.query("DELETE FROM doctors WHERE id = $1", [userId]);
    } else if (admin.rows.length > 0) {
      await db.query("DELETE FROM admins WHERE id = $1", [userId]);
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Admin Delete User Error:", err);
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
};

module.exports = { getAdminSummary, getAllUsers, getDoctors, getPatients, getAdmins,  deleteUser };
