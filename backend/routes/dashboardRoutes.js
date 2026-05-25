const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getDashboardIssues,
  getRecentReports
} = require('../controllers/dashboardController');

// GET /api/dashboard/stats
router.get('/stats', getDashboardStats);

// GET /api/dashboard/issues
router.get('/issues', getDashboardIssues);

// GET /api/dashboard/recent-reports
router.get('/recent-reports', getRecentReports);

module.exports = router;
