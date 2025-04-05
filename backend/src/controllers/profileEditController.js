const db = require("../db");

const editUserProfile = async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  const {
    first_name,
    last_name,
    birth_date,
    phone,
    address,
    blood_type,
    height,
    weight,
    allergies,
    specialization,
    license_number,
    email
  } = req.body;

  try {
    if (!first_name || !last_name) {
      return res.status(400).json({ message: "First and last name are required." });
    }

    if (role === "patient") {
      await db.query(`
        INSERT INTO patients (
          user_id, first_name, last_name, birth_date, phone, address,
          blood_type, height, weight, allergies
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        ON CONFLICT (user_id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          birth_date = EXCLUDED.birth_date,
          phone = EXCLUDED.phone,
          address = EXCLUDED.address,
          blood_type = EXCLUDED.blood_type,
          height = EXCLUDED.height,
          weight = EXCLUDED.weight,
          allergies = EXCLUDED.allergies
      `, [
        userId,
        first_name,
        last_name,
        birth_date,
        phone,
        address,
        blood_type,
        height,
        weight,
        allergies,
      ]);
    } else if (role === "doctor") {
      if (!specialization || !license_number) {
        return res.status(400).json({ message: "Specialization and license number are required." });
      }

      await db.query(`
        INSERT INTO doctors (
          user_id, first_name, last_name, specialization, license_number
        ) VALUES (
          $1, $2, $3, $4, $5
        )
        ON CONFLICT (user_id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          specialization = EXCLUDED.specialization,
          license_number = EXCLUDED.license_number
      `, [
        userId,
        first_name,
        last_name,
        specialization,
        license_number
      ]);
    }

    if (email) {
      await db.query(`UPDATE users SET email = $1 WHERE id = $2`, [email, userId]);
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Edit Profile Error:", err);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};

module.exports = { editUserProfile };
