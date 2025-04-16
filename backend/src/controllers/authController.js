const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const registerUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const validRoles = ["patient", "doctor", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);


    const tokenPayload = { email, role, password: hashedPassword };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, 
    });

    res.status(201).json({
      message: "Registration initiated. Please complete your profile.",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration" });
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
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.rows[0].id,
        role: user.rows[0].role
      }
    });
    
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict"
  });
  res.json({ message: "Logout successful" });
};

const getRegistrationRole = (req, res) => {

  const token = req.cookies?.token;
  console.log("this is the reg role cookie: " + token)
  if (!token) {
    return res.status(401).json({ message: "Registration token missing" });
  }
  
  try {

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { role } = payload;
    return res.json({ role });
  } catch (err) {
    console.error("getRegistrationRole error:", err);
    return res.status(403).json({ message: "Invalid or expired registration token" });
  }
};

module.exports = { registerUser, loginUser, logoutUser, getRegistrationRole };
