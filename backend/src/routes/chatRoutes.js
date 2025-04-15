const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  getDoctorChatHistory,
  getPatientsForDoctor,
  getChatMessages,
  getDoctorsForPatient,
  getUnreadMessages

} = require("../controllers/chatController");

const router = express.Router();

router.get("/history/:patientId", authenticateToken, getDoctorChatHistory);
router.get("/patients", authenticateToken, getPatientsForDoctor);
router.get("/history/room/:roomId", authenticateToken, getChatMessages);
router.get('/doctors', authenticateToken, getDoctorsForPatient);
router.get("/unread", authenticateToken, getUnreadMessages); 


module.exports = router;
