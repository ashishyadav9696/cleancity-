const Report = require('../models/Report');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { apiResponse } = require('../utils/helpers');

// @GET /api/analytics/overview
const getOverview = asyncHandler(async (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);

  const [totalReports, todayReports, weekReports, monthReports, byStatus, totalUsers] = await Promise.all([
    Report.countDocuments(),
    Report.countDocuments({ createdAt: { $gte: today } }),
    Report.countDocuments({ createdAt: { $gte: weekAgo } }),
    Report.countDocuments({ createdAt: { $gte: monthAgo } }),
    Report.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.countDocuments({ role: 'citizen' }),
  ]);

  // Average resolution time (completed reports)
  const resolutionAgg = await Report.aggregate([
    { $match: { status: 'completed', completedAt: { $ne: null } } },
    { $project: { resolutionHours: { $divide: [{ $subtract: ['$completedAt', '$createdAt'] }, 3600000] } } },
    { $group: { _id: null, avgHours: { $avg: '$resolutionHours' } } },
  ]);
  const avgResolutionHours = resolutionAgg[0]?.avgHours || 0;

  const statusMap = {};
  byStatus.forEach(({ _id, count }) => { statusMap[_id] = count; });

  return apiResponse(res, 200, true, 'Analytics overview', {
    totalReports, todayReports, weekReports, monthReports,
    totalUsers,
    pending: statusMap.pending || 0,
    assigned: statusMap.assigned || 0,
    inProgress: statusMap.in_progress || 0,
    completed: statusMap.completed || 0,
    rejected: statusMap.rejected || 0,
    avgResolutionHours: Math.round(avgResolutionHours),
  });
});

// @GET /api/analytics/trend — Daily report count for past N days
const getTrend = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const trend = await Report.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return apiResponse(res, 200, true, 'Report trend', trend);
});

// @GET /api/analytics/category-breakdown
const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const breakdown = await Report.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $project: { name: { $ifNull: ['$category.name', 'Unknown'] }, icon: '$category.icon', color: '$category.color', count: 1 } },
    { $sort: { count: -1 } },
  ]);
  return apiResponse(res, 200, true, 'Category breakdown', breakdown);
});

// @GET /api/analytics/worker-performance
const getWorkerPerformance = asyncHandler(async (req, res) => {
  const performance = await Report.aggregate([
    { $match: { assignedTo: { $ne: null } } },
    {
      $group: {
        _id: '$assignedTo',
        assigned: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        avgResolution: {
          $avg: { $cond: [{ $eq: ['$status', 'completed'] }, { $subtract: ['$completedAt', '$createdAt'] }, null] },
        },
      },
    },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'worker' } },
    { $unwind: { path: '$worker', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        workerName: '$worker.name',
        workerEmail: '$worker.email',
        assigned: 1,
        completed: 1,
        completionRate: { $round: [{ $multiply: [{ $divide: ['$completed', { $max: ['$assigned', 1] }] }, 100] }, 1] },
        avgResolutionHours: { $round: [{ $divide: [{ $ifNull: ['$avgResolution', 0] }, 3600000] }, 1] },
      },
    },
    { $sort: { completed: -1 } },
  ]);
  return apiResponse(res, 200, true, 'Worker performance', performance);
});

// @GET /api/analytics/heatmap — Location clusters for heatmap
const getHeatmap = asyncHandler(async (req, res) => {
  const points = await Report.find({ status: { $ne: 'rejected' } })
    .select('location.coordinates status priority upvoteCount')
    .limit(1000)
    .lean();

  const heatmapData = points.map((p) => ({
    lat: p.location.coordinates[1],
    lng: p.location.coordinates[0],
    weight: 1 + (p.upvoteCount || 0),
  }));

  return apiResponse(res, 200, true, 'Heatmap data', heatmapData);
});

module.exports = { getOverview, getTrend, getCategoryBreakdown, getWorkerPerformance, getHeatmap };
