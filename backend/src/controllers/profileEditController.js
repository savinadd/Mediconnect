const db = require("../db");
const { logActivity } = require("./activityLogController");

const editUserProfile = async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  const {
    name,
    birth_date,
    email,
    phone,
    address,
    bloodType,
    height,
    weight,
    allergies,
    specialization,
    license_number,
    government_id 
  } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: "Name is required." });
    }

    const [firstName, ...lastParts] = name.trim().split(" ");
    const lastName = lastParts.join(" ");

    if (role === "patient") {
      const existing = await db.query(`SELECT id FROM patients WHERE user_id = $1`, [userId]);

      if (existing.rows.length === 0) {
        if (!birth_date || !government_id) {
          return res.status(400).json({ message: "Birth date and Government ID are required for patients." });
        }

        const govCheck = await db.query(`SELECT id FROM patients WHERE government_id = $1`, [government_id]);
        if (govCheck.rows.length > 0) {
          return res.status(400).json({ message: "Government ID already in use." });
        }

        await db.query(`
          INSERT INTO patients (user_id, first_name, last_name, birth_date, phone, address, blood_type, height, weight, allergies, government_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          userId,
          firstName,
          lastName,
          birth_date || null,
          phone || null,
          address || null,
          bloodType || null,
          height || null,
          weight || null,
          allergies || null,
          government_id
        ]);
      } else {
        const govCheck = government_id ? await db.query(
          `SELECT id FROM patients WHERE government_id = $1 AND user_id <> $2`,
          [government_id, userId]
        ) : { rows: [] };
        if (govCheck.rows.length > 0) {
          return res.status(400).json({ message: "Government ID already in use by another user." });
        }

        await db.query(`
          UPDATE patients SET
            first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            birth_date = COALESCE($3, birth_date),
            phone = COALESCE($4, phone),
            address = COALESCE($5, address),
            blood_type = COALESCE($6, blood_type),
            height = COALESCE($7, height),
            weight = COALESCE($8, weight),
            allergies = COALESCE($9, allergies),
            government_id = COALESCE($10, government_id)
          WHERE user_id = $11
        `, [
          firstName,
          lastName,
          birth_date,
          phone,
          address,
          bloodType,
          height,
          weight,
          allergies,
          government_id,
          userId
        ]);
      }

    } else if (role === "doctor") {
      const existing = await db.query(`SELECT id FROM doctors WHERE user_id = $1`, [userId]);

      if (existing.rows.length === 0) {
        await db.query(`
          INSERT INTO doctors (user_id, first_name, last_name, phone, address, specialization, license_number)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          userId,
          firstName,
          lastName,
          phone || null,
          address || null,
          specialization || null,
          license_number || null
        ]);
      } else {
        await db.query(`
          UPDATE doctors SET
            first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            phone = COALESCE($3, phone),
            address = COALESCE($4, address),
            specialization = COALESCE($5, specialization),
            license_number = COALESCE($6, license_number)
          WHERE user_id = $7
        `, [
          firstName,
          lastName,
          phone,
          address,
          specialization,
          license_number,
          userId
        ]);
      }
    }

    if (email) {
      await db.query(`UPDATE users SET email = $1 WHERE id = $2`, [email, userId]);
    }

    await logActivity(userId, role, "Updated profile information");
    res.json({ message: "Profile updated successfully" });

  } catch (err) {
    console.error("Edit Profile Error:", err);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};

module.exports = { editUserProfile };
