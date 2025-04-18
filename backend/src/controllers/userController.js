const db = require("../db");
const { NotFoundError, BadRequestError, InternalServerError, AppError } = require("../utils/errors");

const getUserProfile = async (req, res) => {
  const userId = req.user?.userId;
  const role   = req.user?.role;

  if (!userId) {
    return res.status(200).json({ profileCompleted: false });
  }

  try {
  
    const userResult = await db.query(
      `SELECT id, email FROM users WHERE id = $1`,
      [userId]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(200).json({ profileCompleted: false });
    }


    if (role === "patient") {
      const { rows } = await db.query(
        `
        SELECT first_name, last_name, birth_date, phone, address,
               blood_type, height, weight, allergies, government_id
        FROM patients
        WHERE user_id = $1
        `,
        [userId]
      );

      if (rows.length === 0) {
        return res.status(200).json({
          profileCompleted: false,
          role,
          email: user.email,
          userId: user.id,
        });
      }

      return res.json({
        ...rows[0],
        email: user.email,
        role,
        profileCompleted: true,
        userId: user.id,
      });
    }

    if (role === "doctor") {
      const { rows } = await db.query(
        `
        SELECT first_name, last_name, phone, address,
               specialization, license_number
        FROM doctors
        WHERE user_id = $1
        `,
        [userId]
      );

      if (rows.length === 0) {
        return res.status(200).json({
          profileCompleted: false,
          role,
          email: user.email,
          userId: user.id,
        });
      }

      return res.json({
        ...rows[0],
        email: user.email,
        role,
        profileCompleted: true,
        userId: user.id,
      });
    }

    if (role === "admin") {
      const { rows } = await db.query(
        `
        SELECT first_name, last_name, phone
        FROM admins
        WHERE user_id = $1
        `,
        [userId]
      );

      if (rows.length === 0) {
        return res.status(200).json({
          profileCompleted: false,
          role,
          email: user.email,
          userId: user.id,
        });
      }

      return res.json({
        ...rows[0],
        email: user.email,
        role,
        profileCompleted: true,
        userId: user.id,
      });
    }

    throw new BadRequestError("Invalid role");
  } catch (err) {

    if (err instanceof AppError) throw err;
    console.error("Unexpected error in getUserProfile", err);
    throw new InternalServerError("Server error while fetching profile");
  }
};


const getAllDoctors = async (req, res) => {
  try {
    const result = await db.query("SELECT id, first_name, last_name FROM doctors");
    res.json(result.rows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError("Internal server error upon fetching doctors")
  }
};

const getDoctorId = async (req, res) => {
  try {
    const result = await db.query("SELECT id FROM doctors WHERE user_id = $1", [req.user.userId]);
    res.json({ doctorId: result.rows[0]?.id });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError;
  }
};

const getPatientId = async (req, res) => {
  try {
    const result = await db.query("SELECT id FROM patients WHERE user_id = $1", [req.user.userId]);
    res.json({ patientId: result.rows[0]?.id });
  } catch (err) {
    if (err instanceof AppError) throw err;
   throw new InternalServerError;
  }
};

module.exports = {
  getUserProfile,
  getAllDoctors,
  getDoctorId,
  getPatientId
};
