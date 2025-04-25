const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const { setupUserProfile } = require('../controllers/profileSetupController');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');

router.put(
  '/profile/setup',
  authenticateToken,
  authorizeRoles('patient', 'doctor', 'admin'),
  asyncHandler(setupUserProfile)
);

module.exports = router;
