const express = require("express");
const { registerUser, loginUser, logoutUser } = require("../controllers/authController");
const { body } = require("express-validator");

const router = express.Router();

router.post("/register", [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }).trim().escape(),
  body("role").isIn(["patient", "doctor", "admin"])
], registerUser);

router.post("/login", [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty().trim().escape()
], loginUser);

router.post("/logout", (req, res) => {
  res.clearCookie("token", { sameSite: "Lax", secure: false }); //change for prod!!!
  res.status(200).json({ message: "Logged out" });
});

module.exports = router;
