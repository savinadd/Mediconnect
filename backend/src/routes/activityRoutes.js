const express = require('express');
const { getRecentActivities } = require('../controllers/activityLogController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/recent', authenticateToken, getRecentActivities);

module.exports = router;
