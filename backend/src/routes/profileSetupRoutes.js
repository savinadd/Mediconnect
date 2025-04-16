const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const { setupUserProfile } = require("../controllers/profileSetupController");
const { authorizeRoles } = require("../middlewares/roleMiddleware");


router.put("/profile/setup", authenticateToken, authorizeRoles("patient", "doctor"), setupUserProfile);

module.exports = router;
