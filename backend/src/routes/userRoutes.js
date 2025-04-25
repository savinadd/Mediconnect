const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const { getUserProfile, getDoctorId, getPatientId } = require('../controllers/userController');
const { editUserProfile } = require('../controllers/profileEditController');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');

router.get(
  '/profile',
  authenticateToken,
  authorizeRoles('patient', 'doctor', 'admin'),
  asyncHandler(getUserProfile)
);
router.put(
  '/profile/edit',
  authenticateToken,
  authorizeRoles('patient', 'doctor', 'admin'),
  asyncHandler(editUserProfile)
);
router.get('/doctor-id', authenticateToken, authorizeRoles('doctor'), asyncHandler(getDoctorId));
router.get('/patient-id', authenticateToken, authorizeRoles('patient'), asyncHandler(getPatientId));

module.exports = router;
