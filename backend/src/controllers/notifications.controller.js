const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');
const { apiResponse, parsePagination } = require('../utils/helpers');

// @GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments({ userId: req.user._id }),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
  ]);
  return apiResponse(res, 200, true, 'Notifications', notifications, { page, limit, total, unreadCount });
});

// @PATCH /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true });
  return apiResponse(res, 200, true, 'Marked as read');
});

// @PATCH /api/notifications/read-all
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  return apiResponse(res, 200, true, 'All notifications marked as read');
});

module.exports = { getNotifications, markRead, markAllRead };
