const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const {
  getDoctorsForPatient,
  getChattedDoctorUserIds,
  getPatientsForDoctor,
  getChattedPatientUserIds,
  getChatMessages,
  getUnreadMessages
} = require("../controllers/chatController");

const router = express.Router();

router.get(
  "/doctors",
  authenticateToken,
  getDoctorsForPatient
);

router.get(
  "/chatted-doctors",
  authenticateToken,
  getChattedDoctorUserIds
);


router.get(
  "/patients",
  authenticateToken,
  authorizeRoles("doctor"),
  getPatientsForDoctor
);

router.get(
  "/chatted-patients",
  authenticateToken,
  authorizeRoles("doctor"),
  getChattedPatientUserIds
);

router.get(
  "/history/room/:roomId",
  authenticateToken,
  getChatMessages
);

router.get(
  "/unread",
  authenticateToken,
  getUnreadMessages
);

module.exports = router;
