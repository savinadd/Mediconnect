const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { addPrescription, getPrescriptionsForPatient } = require("../controllers/perscriptionController");

const router = express.Router();

router.post("/add", authenticateToken, addPrescription); 
router.get("/my", authenticateToken, getPrescriptionsForPatient); 

module.exports = router;
