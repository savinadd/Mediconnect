const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const { body } = require("express-validator");

const {
  addPatientSymptom,
  getPatientSymptomHistory
} = require("../controllers/symptomController");

router.post(
  "/log",
  authenticateToken,
  [
    body("symptomName").optional().trim().escape(),
    body("name").optional().trim().escape(),
    body("description").notEmpty().trim().escape(),
    body("severity").optional().trim().escape(),
    body("duration").optional().trim().escape(),
    body("notes").optional().trim().escape()
  ],
  addPatientSymptom
);

router.get("/history", authenticateToken, getPatientSymptomHistory);

module.exports = router;
