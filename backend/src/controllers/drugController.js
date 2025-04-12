const db = require("../db");

const searchDrugs = async (req, res) => {
  const { query } = req.query;
  try {
    const result = await db.query(
      `SELECT id, name FROM drugs WHERE name ILIKE $1 LIMIT 10`,
      [`%${query}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Search drugs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllDrugs = async (req, res) => {
  try {
    const result = await db.query(`SELECT id, name FROM drugs ORDER BY name ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch all drugs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { searchDrugs, getAllDrugs };
