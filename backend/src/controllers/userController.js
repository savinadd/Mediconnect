const db = require("../db");

const getUserProfile = async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    const userResult = await db.query(`SELECT email FROM users WHERE id = $1`, [userId]);
    const email = userResult.rows[0]?.email;

    if (!email) {
      return res.status(404).json({ message: "User email not found." });
    }

    if (role === "patient") {
      const result = await db.query(`
        SELECT first_name, last_name, birth_date, phone, address,
               blood_type, height, weight, allergies, government_id
        FROM patients WHERE user_id = $1
      `, [userId]);

      if (result.rows.length === 0) {
        return res.status(200).json({ profileCompleted: false, role, email });
      }

      const patient = result.rows[0];
      return res.json({ ...patient, email, role, profileCompleted: true });
    }

    if (role === "doctor") {
      const result = await db.query(`
        SELECT first_name, last_name, phone, address,
               specialization, license_number
        FROM doctors WHERE user_id = $1
      `, [userId]);

      if (result.rows.length === 0) {
        return res.status(200).json({ profileCompleted: false, role, email });
      }

      const doctor = result.rows[0];
      return res.json({ ...doctor, email, role, profileCompleted: true });
    }

    return res.status(400).json({ message: "Invalid role" });

  } catch (err) {
    console.error("Get User Profile Error:", err);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const result = await db.query("SELECT id, first_name, last_name FROM doctors");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch Doctors Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getDoctorId = async (req, res) => {
  const result = await db.query("SELECT id FROM doctors WHERE user_id = $1", [req.user.userId]);
  res.json({ doctorId: result.rows[0]?.id });
};

const getPatientId = async (req, res) => {
  const result = await db.query("SELECT id FROM patients WHERE user_id = $1", [req.user.userId]);
  res.json({ patientId: result.rows[0]?.id });
};


module.exports = { getUserProfile , getAllDoctors, getDoctorId, getPatientId};
