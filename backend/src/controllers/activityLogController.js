const db = require("../db");
const { InternalServerError, AppError } = require("../utils/errors");

const logActivity = async (userId, role, description) => {
  await db.query(
    "INSERT INTO activity_logs (user_id, role, description) VALUES ($1, $2, $3)",
    [userId, role, description]
  );
};

const getRecentActivities = async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    const result = await db.query(
      `SELECT description, created_at
       FROM activity_logs
       WHERE user_id = $1 AND role = $2
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId, role]
    );
    res.json(result.rows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError();
  }
};

module.exports = { logActivity, getRecentActivities };
