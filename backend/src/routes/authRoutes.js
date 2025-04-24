const express = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  getRegistrationRole,
} = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/registration-role', getRegistrationRole);

module.exports = router;
