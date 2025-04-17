const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const { getUserProfile, getDoctorId, getPatientId } = require("../controllers/userController");
const { editUserProfile } = require("../controllers/profileEditController");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

router.get(
  "/profile",
  authenticateToken,
  authorizeRoles("patient", "doctor", "admin"),
  getUserProfile
);

router.put(
  "/profile/edit",
  authenticateToken,
  authorizeRoles("patient", "doctor", "admin"),
  editUserProfile
);

router.get("/doctor-id", authenticateToken, authorizeRoles("doctor"), getDoctorId);
router.get("/patient-id", authenticateToken, authorizeRoles("patient"), getPatientId);

module.exports = router;
