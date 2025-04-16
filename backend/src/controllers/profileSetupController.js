const jwt = require("jsonwebtoken");
const db = require("../db");
const { patientProfileSchema, doctorProfileSchema, adminProfileSchema } = require("../schemas/userSchema");

const setupUserProfile = async (req, res) => {
  const { role } = req.user; 
  const { email, password } = req.user; 
  let validatedData;

  try {
    if (role === "patient") {
      validatedData = patientProfileSchema.parse(req.body);
    } else if (role === "doctor") {
      validatedData = doctorProfileSchema.parse(req.body);
    } else if (role === "admin") {
      validatedData = adminProfileSchema.parse(req.body);
    } else {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const newUser = await db.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id",
      [email, password, role]
    );
    const userId = newUser.rows[0].id;

    if (role === "patient") {
      await db.query(
        `INSERT INTO patients (user_id, first_name, last_name, phone, address, birth_date, government_id, blood_type, height, weight, allergies)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          userId,
          validatedData.first_name,
          validatedData.last_name,
          validatedData.phone,
          validatedData.address,
          validatedData.birth_date,
          validatedData.government_id,
          validatedData.blood_type,
          validatedData.height,
          validatedData.weight,
          validatedData.allergies,
        ]
      );
    } else if (role === "doctor") {
      await db.query(
        `INSERT INTO doctors (user_id, first_name, last_name, phone, address, specialization, license_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
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
    } else if (role === "admin") {
      await db.query(
        `INSERT INTO admins (user_id, first_name, last_name, phone)
         VALUES ($1, $2, $3, $4)`,
        [
          userId,
          validatedData.first_name,
          validatedData.last_name,
          validatedData.phone,
        ]
      );
    }


    const token = jwt.sign(
      { userId, role, email },  
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Profile setup successful",
      user: { id: userId, role, email },
    });
  } catch (err) {
    console.error("Error setting up user profile:", err);
    return res.status(500).json({ message: "Error during profile setup", error: err.message });
  }
};

module.exports = { setupUserProfile };
