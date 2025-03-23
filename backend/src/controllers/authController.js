const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db"); // Ensure this is the correct path to your DB connection

const registerUser = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Email validation (basic regex check)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  // Password validation (minimum length)
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  // Role validation
  const validRoles = ["patient", "doctor", "admin"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role specified." });
  }

  try {
    // Check if email already exists
    const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    const newUser = await db.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, hashedPassword, role]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "User registered successfully", token, user: newUser.rows[0] });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token, user: { id: user.rows[0].id, role: user.rows[0].role } });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export the functions
module.exports = { registerUser, loginUser };
