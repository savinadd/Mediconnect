const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController"); // Ensure this path is correct

const router = express.Router();

router.post("/register", registerUser); // Ensure `registerUser` exists
router.post("/login", loginUser); // Ensure `loginUser` exists

module.exports = router;
