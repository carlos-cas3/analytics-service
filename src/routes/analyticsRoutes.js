const { Router } = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = Router();

router.get('/api/v1/analytics/dashboard', analyticsController.getSuperAdminDashboard);
router.get('/api/v1/analytics/analytics', analyticsController.getSuperAdminAnalytics);
router.get('/api/v1/analytics/vendor/dashboard', analyticsController.getVendorDashboard);
router.get('/api/v1/analytics/vendor/analytics', analyticsController.getVendorAnalytics);

module.exports = router;
