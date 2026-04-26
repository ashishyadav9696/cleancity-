const express = require('express');
const router = express.Router();
const { getOverview, getTrend, getCategoryBreakdown, getWorkerPerformance, getHeatmap } = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('nagarpalika', 'admin'));
router.get('/overview', getOverview);
router.get('/trend', getTrend);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/worker-performance', getWorkerPerformance);
router.get('/heatmap', getHeatmap);

module.exports = router;
