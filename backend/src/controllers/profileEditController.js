const db = require("../db");
const { patientProfileSchema, doctorProfileSchema, adminProfileSchema } = require("../schemas/userSchema");
const { logActivity } = require("./activityLogController");

const editUserProfile = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.userId;

    let parsed;
    if (role === "patient") {
      parsed = patientProfileSchema.parse(req.body);
    } else if (role === "doctor") {
      parsed = doctorProfileSchema.parse(req.body);
    } else if (role === "admin") {
      parsed = adminProfileSchema.parse(req.body);
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }


    if (role === "patient") {
      const { first_name, last_name, phone, address, birth_date, government_id, bloodType, height, weight, allergies } = parsed;
      const [first_name_split, ...rest] = first_name.split(" ");
      const last_name_combined = rest.join(" ");

      await db.query(`
        UPDATE patients SET 
          first_name = $1, 
          last_name = $2, 
          birth_date = $3, 
          phone = $4, 
          address = $5, 
          blood_type = $6, 
          height = $7, 
          weight = $8, 
          allergies = $9 
        WHERE user_id = $10
      `, [first_name_split, last_name_combined, birth_date, phone, address, bloodType, height, weight, allergies, userId]);

    } 

    else if (role === "doctor") {
      const { first_name, last_name, phone, address, specialization, license_number } = parsed;
      const [first_name_split, ...rest] = first_name.split(" ");
      const last_name_combined = rest.join(" ");

      await db.query(`
        UPDATE doctors SET 
          first_name = $1, 
          last_name = $2, 
          phone = $3, 
          address = $4, 
          specialization = $5, 
          license_number = $6 
        WHERE user_id = $7
      `, [first_name_split, last_name_combined, phone, address, specialization, license_number, userId]);

    } 

    else if (role === "admin") {
      const { first_name, last_name, phone, email } = parsed;

      const existing = await db.query("SELECT id FROM admins WHERE user_id = $1", [userId]);
      if (existing.rows.length > 0) {
        await db.query(`
          UPDATE admins SET first_name = $1, last_name = $2, phone = $3, email = $4
          WHERE user_id = $5
        `, [first_name, last_name, phone, email, userId]);
      } else {
        await db.query(`
          INSERT INTO admins (user_id, first_name, last_name, phone, email)
          VALUES ($1, $2, $3, $4, $5)
        `, [userId, first_name, last_name, phone, email]);
      }
    }

    await logActivity(userId, role, "Updated their profile");
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Edit profile error:", err);
    if (err.errors) {
      res.status(400).json({ errors: err.errors });
    } else {
      res.status(500).json({ message: "Server error during profile update" });
    }
  }
};

module.exports = { editUserProfile };
