const db = require('../db');
const {
  patientProfileSchema,
  doctorProfileSchema,
  adminProfileSchema,
} = require('../schemas/userSchema');
const { BadRequestError, InternalServerError, AppError } = require('../utils/errors');

const setupUserProfile = async (req, res) => {
  const { role, userId } = req.user;
  let validatedData;

  try {
    if (role === 'patient') {
      validatedData = patientProfileSchema.parse(req.body);
    } else if (role === 'doctor') {
      validatedData = doctorProfileSchema.parse(req.body);
    } else if (role === 'admin') {
      validatedData = adminProfileSchema.parse(req.body);
    } else {
      throw new BadRequestError('Invalid role specified');
    }

    if (role === 'patient') {
      await db.query(
        `INSERT INTO patients (
           user_id, first_name, last_name, phone, address,
           birth_date, government_id, blood_type, height, weight, allergies
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
         )`,
        [
          userId,
          validatedData.first_name,
          validatedData.last_name,
          validatedData.phone,
          validatedData.address,
          validatedData.birth_date,
          validatedData.government_id,
          validatedData.blood_type,
          Number(validatedData.height),
          Number(validatedData.weight),
          validatedData.allergies,
        ]
      );
    } else if (role === 'doctor') {
      await db.query(
        `INSERT INTO doctors (
           user_id, first_name, last_name, phone, address,
           specialization, license_number
         ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          userId,
          validatedData.first_name,
          validatedData.last_name,
          validatedData.phone,
          validatedData.address,
          validatedData.specialization,
          validatedData.license_number,
        ]
      );
    } else {
      await db.query(
        `INSERT INTO admins (
           user_id, first_name, last_name, phone
         ) VALUES ($1,$2,$3,$4)`,
        [userId, validatedData.first_name, validatedData.last_name, validatedData.phone]
      );
    }

    res.status(200).json({ message: 'Profile setup successful' });
  } catch (err) {
    console.error('Profile setup error:', err);
    if (err.errors) {
      const formatted = err.errors.map(e => ({ msg: e.message }));
      return res.status(400).json({ errors: formatted });
    }
    if (err instanceof AppError) throw err;
    throw new InternalServerError('Error during profile setup');
  }
};

module.exports = { setupUserProfile };
