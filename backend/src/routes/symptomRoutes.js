const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");

const {
  addPatientSymptom,
  getPatientSymptomHistory
} = require("../controllers/symptomController"); 

router.post("/log", authenticateToken, addPatientSymptom);
router.get("/history", authenticateToken, getPatientSymptomHistory);

module.exports = router;
