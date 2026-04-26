/**
 * Log an activity to the ActivityLog collection
 */
const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ userId, userEmail, action, resource, resourceId, reportId, details, ip }) => {
  try {
    await ActivityLog.create({ userId, userEmail, action, resource, resourceId, reportId, details, ip });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

/**
 * Create a DB notification and emit via Socket.io
 */
const Notification = require('../models/Notification');
const { emitToUser } = require('../services/socket.service');

const createNotification = async ({ userId, title, message, type, reportId, trackingId }) => {
  try {
    const notification = await Notification.create({ userId, title, message, type, reportId, trackingId });
    emitToUser(userId.toString(), 'notification', notification);
    return notification;
  } catch (err) {
    console.error('Notification create error:', err.message);
  }
};

/**
 * Build a standard API response
 */
const apiResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(statusCode).json(response);
};

/**
 * Parse pagination query params
 */
const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = { logActivity, createNotification, apiResponse, parsePagination };
