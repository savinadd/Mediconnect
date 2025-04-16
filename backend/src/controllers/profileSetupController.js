const db = require("../db");

const setupUserProfile = async (req, res) => {
  const { role, userId } = req.user; // Assuming userId is from the authenticated user

  try {
    // Destructure the necessary fields from the request body
    const { first_name, last_name, phone, address, birth_date, government_id, blood_type, height, weight, allergies, specialization, license_number } = req.body;

    // Check for required fields based on user role
    if (!first_name || !last_name || !phone || !address) {
      return res.status(400).json({ message: "First name, last name, phone, and address are required" });
    }

    if (role === "patient") {
      // Check if the patient fields are valid
      if (!birth_date || !government_id || !blood_type || !height || !weight || !allergies) {
        return res.status(400).json({ message: "All patient fields are required" });
      }

      // Insert data into the 'patients' table
      await db.query(
        `INSERT INTO patients (user_id, first_name, last_name, phone, address, birth_date, government_id, blood_type, height, weight, allergies)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [userId, first_name, last_name, phone, address, birth_date, government_id, blood_type, height, weight, allergies]
      );
    } else if (role === "doctor") {
      // Check if the doctor fields are valid
      if (!specialization || !license_number) {
        return res.status(400).json({ message: "Specialization and license number are required" });
      }

      // Insert data into the 'doctors' table
      await db.query(
        `INSERT INTO doctors (user_id, first_name, last_name, phone, address, specialization, license_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, first_name, last_name, phone, address, specialization, license_number]
      );
    } else if (role === "admin") {
      // Admin doesn't have additional fields, so we only insert name and phone
      await db.query(
        `INSERT INTO admins (user_id, first_name, last_name, phone)
         VALUES ($1, $2, $3, $4)`,
        [userId, first_name, last_name, phone]
      );
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Successfully saved profile
    res.status(200).json({ message: "Profile setup successfully" });

  } catch (err) {
    console.error("Error setting up user profile:", err);
    res.status(500).json({ message: "Error during profile setup", error: err.message });
  }
};

module.exports = { setupUserProfile };
