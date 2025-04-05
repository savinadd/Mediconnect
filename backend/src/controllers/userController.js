const db = require("../db");

const getUserProfile = async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    if (role === "patient") {
        const user = await db.query("SELECT email FROM users WHERE id = $1", [userId]);

      const patient = await db.query("SELECT * FROM patients WHERE user_id = $1", [userId]);

      if (patient.rows.length === 0) return res.status(404).json({ message: "Patient not found" });

      return res.json({
        ...patient.rows[0],
        email: user.rows[0].email,
        profile_picture: user.rows[0].profile_picture,
      });
    } else if (role === "doctor") {
        const user = await db.query("SELECT email FROM users WHERE id = $1", [userId]);

      const doctor = await db.query("SELECT * FROM doctors WHERE user_id = $1", [userId]);

      if (doctor.rows.length === 0) return res.status(404).json({ message: "Doctor not found" });

      return res.json({
        ...doctor.rows[0],
        email: user.rows[0].email,
        profile_picture: user.rows[0].profile_picture,
      });
    } else {
      return res.status(403).json({ message: "Admins do not have a profile view" });
    }
  } catch (err) {
    console.error("Fetch Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUserProfile };
