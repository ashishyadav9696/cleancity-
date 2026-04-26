const express = require('express');
const router = express.Router();
const {
  createReport, trackReport, getReports, getNearbyReports,
  getReportById, assignReport, updateStatus, setPriority,
  addNote, upvoteReport, getMyReports,
} = require('../controllers/reports.controller');
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');
const { reportLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

// Public
router.get('/track/:trackingId', trackReport);
router.get('/nearby', getNearbyReports);

// Mixed auth (optional login)
router.post('/', optionalAuth, reportLimiter, upload.single('photo'), createReport);

// Authenticated — Citizens
router.get('/my', authenticate, getMyReports);
router.post('/:id/upvote', authenticate, authorize('citizen'), upvoteReport);

// Staff/Admin
router.get('/', authenticate, authorize('nagarpalika', 'admin', 'worker'), getReports);
router.get('/:id', authenticate, getReportById);
router.patch('/:id/assign', authenticate, authorize('nagarpalika', 'admin'), assignReport);
router.patch('/:id/status', authenticate, authorize('nagarpalika', 'admin', 'worker'), upload.single('afterPhoto'), updateStatus);
router.patch('/:id/priority', authenticate, authorize('nagarpalika', 'admin'), setPriority);
router.post('/:id/notes', authenticate, authorize('nagarpalika', 'admin'), addNote);

module.exports = router;
