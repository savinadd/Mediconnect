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

router.post("/logout", logoutUser);

module.exports = router;
