const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

module.exports = router;
