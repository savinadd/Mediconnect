const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const { getUserProfile, getDoctorId, getPatientId } = require("../controllers/userController");
const { editUserProfile } = require("../controllers/profileEditController");
const { body } = require("express-validator");


const { authorizeRoles } = require("../middlewares/roleMiddleware");

router.get("/profile", authenticateToken, authorizeRoles("patient", "doctor", "admin"), getUserProfile);
router.put("/profile/edit",
  authenticateToken,
  authorizeRoles("patient", "doctor", "admin"),
  [
    body("name").optional().trim().escape(),
    body("email").optional().isEmail().normalizeEmail(),
    body("phone").optional().trim().escape(),
    body("address").optional().trim().escape()
  ],
  editUserProfile
);

router.get("/doctor-id", authenticateToken, authorizeRoles("doctor"), getDoctorId);
router.get("/patient-id", authenticateToken, authorizeRoles("patient"), getPatientId);


module.exports = router;
