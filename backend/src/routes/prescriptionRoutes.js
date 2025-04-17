const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { addPrescription, getPrescriptionsForPatient, getPrescriptionsByDoctor, endPrescription } = require("../controllers/prescriptionController");

const router = express.Router();

router.post("/add", authenticateToken, addPrescription); 
router.get("/my", authenticateToken, getPrescriptionsForPatient); 
router.get("/by-doctor", authenticateToken, getPrescriptionsByDoctor);
router.put("/end/:id", authenticateToken, endPrescription);

module.exports = router;
