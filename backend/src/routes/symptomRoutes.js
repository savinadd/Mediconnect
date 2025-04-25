const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const { addPatientSymptom, getPatientSymptomHistory } = require('../controllers/symptomController');
const asyncHandler = require('../utils/asyncHandler');

router.post('/log', authenticateToken, asyncHandler(addPatientSymptom));
router.get('/history', authenticateToken, asyncHandler(getPatientSymptomHistory));

module.exports = router;
