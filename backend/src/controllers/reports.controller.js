const Report = require('../models/Report');
const Category = require('../models/Category');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary } = require('../services/cloudinary.service');
const { emitNewReport, emitStatusUpdate } = require('../services/socket.service');
const { sendComplaintReceivedEmail, sendStatusUpdateEmail, sendAssignmentEmail } = require('../services/mail.service');
const { logActivity, createNotification, apiResponse, parsePagination } = require('../utils/helpers');
const User = require('../models/User');

// @POST /api/reports  — Create complaint (auth optional)
const createReport = asyncHandler(async (req, res) => {
  const { categoryId, description, latitude, longitude, address, landmark, isAnonymous, anonymousContact } = req.body;

  if (!req.file) return apiResponse(res, 400, false, 'Photo is required');
  if (!categoryId) return apiResponse(res, 400, false, 'Category is required');
  if (!latitude || !longitude) return apiResponse(res, 400, false, 'Location coordinates are required');

  const category = await Category.findById(categoryId);
  if (!category) return apiResponse(res, 404, false, 'Invalid category');

  // Upload image to Cloudinary
  const { url, publicId } = await uploadToCloudinary(req.file.buffer, 'cleancity/reports');

  const anonymous = req.user ? (isAnonymous === 'true' || isAnonymous === true) : true;

  const report = await Report.create({
    reportedBy: req.user?._id || null,
    isAnonymous: anonymous,
    anonymousContact: anonymous ? anonymousContact : undefined,
    photo: url,
    photoPublicId: publicId,
    location: {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
      address,
      landmark,
    },
    category: categoryId,
    description,
    statusHistory: [{ status: 'pending', note: 'Complaint submitted' }],
  });

  await report.populate('category', 'name icon color');

  // Notify nagarpalika staff via socket
  emitNewReport(report);

  // Email notification
  const emailTarget = req.user?.email || anonymousContact;
  if (emailTarget && emailTarget.includes('@')) {
    sendComplaintReceivedEmail(emailTarget, report.trackingId, category.name).catch(() => {});
  }

  // In-app notification for logged-in user
  if (req.user) {
    await createNotification({
      userId: req.user._id,
      title: 'Complaint Submitted',
      message: `Your complaint about ${category.name} has been received. Tracking ID: ${report.trackingId}`,
      type: 'report_created',
      reportId: report._id,
      trackingId: report.trackingId,
    });
  }

  logActivity({ userId: req.user?._id, userEmail: req.user?.email, action: 'REPORT_CREATE', resource: 'report', resourceId: report._id, details: { trackingId: report.trackingId } });

  return apiResponse(res, 201, true, 'Complaint submitted successfully', { report, trackingId: report.trackingId });
});

// @GET /api/reports/track/:trackingId — Public tracking
const trackReport = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ trackingId: req.params.trackingId.toUpperCase() })
    .populate('category', 'name icon color')
    .populate('assignedTo', 'name')
    .select('-photoPublicId -beforePhotoPublicId -afterPhotoPublicId -internalNotes -anonymousContact');

  if (!report) return apiResponse(res, 404, false, 'Complaint not found with this tracking ID');
  return apiResponse(res, 200, true, 'Complaint found', report);
});

// @GET /api/reports — List reports (staff/admin, paginated + filtered)
const getReports = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status, priority, category, assignedTo, startDate, endDate, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
  }
  // Workers see only their assigned reports
  if (req.user.role === 'worker') filter.assignedTo = req.user._id;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name icon color')
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name'),
    Report.countDocuments(filter),
  ]);

  return apiResponse(res, 200, true, 'Reports fetched', reports, {
    page, limit, total, pages: Math.ceil(total / limit),
  });
});

// @GET /api/reports/nearby — Geospatial nearby query (public)
const getNearbyReports = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 2000 } = req.query; // radius in meters
  if (!lat || !lng) return apiResponse(res, 400, false, 'lat and lng required');

  const reports = await Report.find({
    status: { $ne: 'completed' },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseInt(radius),
      },
    },
  })
    .limit(50)
    .populate('category', 'name icon color')
    .select('trackingId location category status priority upvoteCount createdAt photo');

  return apiResponse(res, 200, true, 'Nearby reports', reports);
});

// @GET /api/reports/:id
const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate('category', 'name icon color')
    .populate('reportedBy', 'name email phone')
    .populate('assignedTo', 'name email phone')
    .populate('assignedBy', 'name')
    .populate('internalNotes.addedBy', 'name');

  if (!report) return apiResponse(res, 404, false, 'Report not found');

  // Citizens can only see their own reports
  if (req.user?.role === 'citizen' && report.reportedBy?._id?.toString() !== req.user._id.toString()) {
    return apiResponse(res, 403, false, 'Access denied');
  }

  return apiResponse(res, 200, true, 'Report fetched', report);
});

// @PATCH /api/reports/:id/assign
const assignReport = asyncHandler(async (req, res) => {
  const { workerId, priority } = req.body;
  const report = await Report.findById(req.params.id);
  if (!report) return apiResponse(res, 404, false, 'Report not found');

  const worker = await User.findOne({ _id: workerId, role: 'worker' });
  if (!worker) return apiResponse(res, 404, false, 'Worker not found');

  report.assignedTo = workerId;
  report.assignedBy = req.user._id;
  report.assignedAt = new Date();
  report.status = 'assigned';
  if (priority) report.priority = priority;
  report.statusHistory.push({ status: 'assigned', changedBy: req.user._id, note: `Assigned to ${worker.name}` });
  await report.save();
  await report.populate('category', 'name');

  // Notify worker
  await createNotification({ userId: workerId, title: 'New Task Assigned', message: `You have a new ${report.category.name} task (${report.trackingId})`, type: 'assigned', reportId: report._id, trackingId: report.trackingId });
  sendAssignmentEmail(worker.email, worker.name, report).catch(() => {});

  // Notify reporter
  if (report.reportedBy) {
    await createNotification({ userId: report.reportedBy, title: 'Complaint Assigned', message: `Your complaint ${report.trackingId} has been assigned to a worker`, type: 'status_update', reportId: report._id, trackingId: report.trackingId });
    emitStatusUpdate(report.reportedBy.toString(), { trackingId: report.trackingId, status: 'assigned' });
  }

  logActivity({ userId: req.user._id, userEmail: req.user.email, action: 'REPORT_ASSIGN', resource: 'report', resourceId: report._id, details: { workerId, priority } });
  return apiResponse(res, 200, true, 'Report assigned successfully', report);
});

// @PATCH /api/reports/:id/status
const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const VALID_STATUSES = ['pending', 'assigned', 'in_progress', 'in_review', 'completed', 'rejected'];
  if (!VALID_STATUSES.includes(status)) return apiResponse(res, 400, false, 'Invalid status');

  const report = await Report.findById(req.params.id).populate('reportedBy', 'name email').populate('category', 'name');
  if (!report) return apiResponse(res, 404, false, 'Report not found');

  // Workers can only update their own assigned reports
  if (req.user.role === 'worker' && report.assignedTo?.toString() !== req.user._id.toString()) {
    return apiResponse(res, 403, false, 'You can only update your assigned reports');
  }

  // Prevent worker from marking as completed
  if (req.user.role === 'worker' && status === 'completed') {
    return apiResponse(res, 403, false, 'Workers cannot mark as completed directly. Please mark as in_review and upload a photo.');
  }

  // Handle before-photo upload when transitioning to in_progress
  const beforeFile = req.files?.beforePhoto?.[0];
  if ((status === 'in_progress') && beforeFile) {
    const { url, publicId } = await uploadToCloudinary(beforeFile.buffer, 'cleancity/before');
    report.beforePhoto = url;
    report.beforePhotoPublicId = publicId;
  }

  // Handle after-photo upload for completion or review
  const afterFile = req.files?.afterPhoto?.[0];
  if ((status === 'completed' || status === 'in_review') && afterFile) {
    const { url, publicId } = await uploadToCloudinary(afterFile.buffer, 'cleancity/after');
    report.afterPhoto = url;
    report.afterPhotoPublicId = publicId;
    if (status === 'completed') report.completedAt = new Date();
  }

  // When staff marks as completed, set completedAt
  if (status === 'completed' && req.user.role !== 'worker') {
    report.completedAt = new Date();
  }

  const prevStatus = report.status;
  report.status = status;
  report.statusHistory.push({ status, changedBy: req.user._id, note: note || `Status updated to ${status}` });
  await report.save();

  // Populate the report fully before returning
  await report.populate('assignedTo', 'name email');
  await report.populate('assignedBy', 'name');
  await report.populate('internalNotes.addedBy', 'name');

  // Notify reporter
  if (report.reportedBy) {
    const reporter = report.reportedBy;
    await createNotification({ userId: reporter._id, title: 'Status Update', message: `Your complaint ${report.trackingId} is now: ${status.replace('_', ' ')}`, type: 'status_update', reportId: report._id, trackingId: report.trackingId });
    sendStatusUpdateEmail(reporter.email, reporter.name, report.trackingId, status, report.category?.name).catch(() => {});
    emitStatusUpdate(reporter._id.toString(), { trackingId: report.trackingId, status });
  }

  logActivity({ userId: req.user._id, userEmail: req.user.email, action: 'REPORT_STATUS_UPDATE', resource: 'report', resourceId: report._id, details: { from: prevStatus, to: status } });
  return apiResponse(res, 200, true, 'Status updated', report);
});


// @PATCH /api/reports/:id/priority
const setPriority = asyncHandler(async (req, res) => {
  const { priority } = req.body;
  const report = await Report.findByIdAndUpdate(req.params.id, { priority }, { new: true });
  if (!report) return apiResponse(res, 404, false, 'Report not found');
  logActivity({ userId: req.user._id, action: 'REPORT_PRIORITY', resource: 'report', resourceId: report._id, details: { priority } });
  return apiResponse(res, 200, true, 'Priority updated', report);
});

// @POST /api/reports/:id/notes
const addNote = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) return apiResponse(res, 400, false, 'Note text required');
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { $push: { internalNotes: { text, addedBy: req.user._id } } },
    { new: true }
  ).populate('internalNotes.addedBy', 'name');
  if (!report) return apiResponse(res, 404, false, 'Report not found');
  return apiResponse(res, 200, true, 'Note added', report.internalNotes);
});

// @POST /api/reports/:id/upvote
const upvoteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return apiResponse(res, 404, false, 'Report not found');

  const userId = req.user._id;
  const alreadyUpvoted = report.upvotes.includes(userId);
  if (alreadyUpvoted) {
    report.upvotes.pull(userId);
    report.upvoteCount = Math.max(0, report.upvoteCount - 1);
  } else {
    report.upvotes.push(userId);
    report.upvoteCount += 1;
  }
  await report.save();
  return apiResponse(res, 200, true, alreadyUpvoted ? 'Upvote removed' : 'Upvoted', { upvoteCount: report.upvoteCount, upvoted: !alreadyUpvoted });
});

// @GET /api/reports/my — Citizen's own complaints
const getMyReports = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const [reports, total] = await Promise.all([
    Report.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name icon color')
      .populate('assignedTo', 'name'),
    Report.countDocuments({ reportedBy: req.user._id }),
  ]);
  return apiResponse(res, 200, true, 'My reports', reports, { page, limit, total, pages: Math.ceil(total / limit) });
});

module.exports = { createReport, trackReport, getReports, getNearbyReports, getReportById, assignReport, updateStatus, setPriority, addNote, upvoteReport, getMyReports };
