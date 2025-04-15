const db = require("../db");

const getAdminSummary = async (req, res) => {
  try {
    const users = await db.query("SELECT COUNT(*) FROM users");
    const doctors = await db.query("SELECT COUNT(*) FROM doctors");
    const patients = await db.query("SELECT COUNT(*) FROM patients");

    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalDoctors: parseInt(doctors.rows[0].count),
      totalPatients: parseInt(patients.rows[0].count)
    });
  } catch (err) {
    console.error("Admin summary error:", err);
    res.status(500).json({ message: "Server error fetching summary" });
  }
};

module.exports = { getAdminSummary };
