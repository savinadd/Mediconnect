const db = require("../db");
const { InternalServerError, AppError } = require("../utils/errors");

const searchDrugs = async (req, res) => {
  const { query } = req.query;
  try {
    const result = await db.query(
      `SELECT id, name FROM drugs WHERE name ILIKE $1 LIMIT 10`,
      [`%${query}%`]
    );
    res.json(result.rows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError;
  }
};

const getAllDrugs = async (req, res) => {
  try {
    const result = await db.query(`SELECT id, name FROM drugs ORDER BY name ASC`);
    res.json(result.rows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError;
  }
};

module.exports = { searchDrugs, getAllDrugs };
