const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
  AppError
} = require("../utils/errors");

const registerUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      throw new BadRequestError("All fields are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError("Invalid email format.");
    }

    // password strength: ≥6 chars, letters, numbers, special
    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
    if (!pwRegex.test(password)) {
      throw new BadRequestError(
        "Password must be at least 6 characters long and include letters, numbers, and a special character."
      );
    }
    const validRoles = ["patient", "doctor", "admin"];
    if (!validRoles.includes(role)) {
      throw new BadRequestError("Invalid role specified.");
    }

    const { rows: exists } = await db.query(
      "SELECT 1 FROM users WHERE email = $1",
      [email]
    );
    if (exists.length) {
      throw new BadRequestError("Email already in use.");
    }

    const hashed = await bcrypt.hash(password, 10);
    const token = jwt.sign(
      { email, role, password: hashed },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Registration initiated. Please complete your profile.",
    });

  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError("Server error during registration");
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("All fields are required");
  }

  try {
    const { rows } = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = rows[0];
    if (!user) {
      throw new BadRequestError("Invalid email or password");
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      throw new BadRequestError("Invalid email or password");
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: { id: user.id, role: user.role },
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError("Internal server error upon logging in");
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });
  res.json({ message: "Logout successful" });
};

const getRegistrationRole = (req, res) => {
  const token = req.cookies?.token;
  if (!token) {
    throw new UnauthorizedError("Registration token missing");
  }
  try {
    const { role } = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ role });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new ForbiddenError("Invalid or expired registration token");
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getRegistrationRole
};
