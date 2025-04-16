const db = require("../db");

const getUserProfile = async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;
  console.log('is this the issue')
  try {
    const userResult = await db.query(`SELECT id, email FROM users WHERE id = $1`, [userId]);
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (role === "patient") {
      console.log('is this the issue2')
      const result = await db.query(`
        SELECT first_name, last_name, birth_date, phone, address,
               blood_type, height, weight, allergies, government_id
        FROM patients WHERE user_id = $1
      `, [userId]);

      if (result.rows.length === 0) {
        return res.status(200).json({ profileCompleted: false, role, email: user.email, userId: user.id });
      }

      return res.json({ ...result.rows[0], email: user.email, role, profileCompleted: true, userId: user.id });
    }

    if (role === "doctor") {
      const result = await db.query(`
        SELECT first_name, last_name, phone, address,
               specialization, license_number
        FROM doctors WHERE user_id = $1
      `, [userId]);

      if (result.rows.length === 0) {
        return res.status(200).json({ profileCompleted: false, role, email: user.email, userId: user.id });
      }

      return res.json({ ...result.rows[0], email: user.email, role, profileCompleted: true, userId: user.id });
    }
    if (role === "admin") {
      const result = await db.query(`
        SELECT first_name, last_name, phone
        FROM admins
        WHERE user_id = $1
      `, [userId]);
    
      if (result.rows.length === 0) {
        return res.status(200).json({ profileCompleted: false, role, email: user.email, userId: user.id });
      }
    
      return res.json({
        ...result.rows[0],
        email: user.email,
        role,
        profileCompleted: true,
        userId: user.id,
      });
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
  try {
    const result = await db.query("SELECT id FROM doctors WHERE user_id = $1", [req.user.userId]);
    res.json({ doctorId: result.rows[0]?.id });
  } catch (err) {
    console.error("Fetch Doctor ID Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getPatientId = async (req, res) => {
  try {
    const result = await db.query("SELECT id FROM patients WHERE user_id = $1", [req.user.userId]);
    res.json({ patientId: result.rows[0]?.id });
  } catch (err) {
    console.error("Fetch Patient ID Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUserProfile,
  getAllDoctors,
  getDoctorId,
  getPatientId
};
