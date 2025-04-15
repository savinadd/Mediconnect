const db = require("../db");
const { patientSchema, doctorSchema, adminSchema } = require("../schemas/editprofileSchema");
const {logActivity} = require("./activityLogController")

const editUserProfile = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.userId;

    let parsed;
    if (role === "patient") {
      parsed = patientSchema.parse(req.body);
    } else if (role === "doctor") {
      parsed = doctorSchema.parse(req.body);
    } else if (role === "admin") {
      parsed = adminSchema.parse(req.body);
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    if (role === "patient") {
      const {
        name, phone, address,
        birth_date, government_id, bloodType, height, weight, allergies
      } = parsed;
    
      const [first_name, ...rest] = name.trim().split(" ");
      const last_name = rest.join(" ");
    
      await db.query(
        `UPDATE patients SET 
          first_name = $1, 
          last_name = $2, 
          birth_date = $3, 
          phone = $4, 
          address = $5, 
          blood_type = $6, 
          height = $7, 
          weight = $8, 
          allergies = $9 
        WHERE user_id = $10`,
        [first_name, last_name, birth_date, phone, address, bloodType, height, weight, allergies, userId]
      );
    
    } else if (role === "doctor") {
      const {
        name, phone, address,
        specialization, license_number
      } = parsed;
    
      const [first_name, ...rest] = name.trim().split(" ");
      const last_name = rest.join(" ");
    
      await db.query(
        `UPDATE doctors SET 
          first_name = $1, 
          last_name = $2, 
          phone = $3, 
          address = $4, 
          specialization = $5, 
          license_number = $6 
        WHERE user_id = $7`,
        [first_name, last_name, phone, address, specialization || "", license_number || "", userId]
      );
    
    } else if (role === "admin") {
      const { first_name, last_name, phone } = parsed;
    
      const existing = await db.query("SELECT id FROM admins WHERE user_id = $1", [userId]);
      if (existing.rows.length > 0) {
        await db.query(`
          UPDATE admins SET first_name = $1, last_name = $2, phone = $3
          WHERE user_id = $4
        `, [first_name, last_name, phone, userId]);
      } else {
        await db.query(`
          INSERT INTO admins (user_id, first_name, last_name, phone)
          VALUES ($1, $2, $3, $4)
        `, [userId, first_name, last_name, phone]);
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
