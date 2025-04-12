const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const { getUserProfile } = require("../controllers/userController");
const { editUserProfile } = require("../controllers/profileEditController");
const {getDoctorId, getPatientId} = require("../controllers/userController")

router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile/edit", authenticateToken, editUserProfile);
router.get("/doctor-id", authenticateToken, getDoctorId);
router.get("/patient-id", authenticateToken, getPatientId);

module.exports = router;
