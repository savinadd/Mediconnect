const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const { getUserProfile } = require("../controllers/userController");
const { editUserProfile } = require("../controllers/profileEditController");

router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile/edit", authenticateToken, editUserProfile);

module.exports = router;
