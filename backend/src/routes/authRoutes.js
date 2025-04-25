const express = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  getRegistrationRole,
} = require('../controllers/authController');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');

router.post('/register', asyncHandler(registerUser));
router.post('/login', asyncHandler(loginUser));
router.post('/logout', logoutUser);
router.get('/registration-role', asyncHandler(getRegistrationRole));

module.exports = router;
