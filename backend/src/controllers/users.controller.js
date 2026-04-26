const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { logActivity, apiResponse, parsePagination } = require('../utils/helpers');

// @GET /api/users — List users (admin only, paginated)
const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { role, search, isActive } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-passwordHash -refreshToken'),
    User.countDocuments(filter),
  ]);

  return apiResponse(res, 200, true, 'Users fetched', users, { page, limit, total, pages: Math.ceil(total / limit) });
});

// @GET /api/users/workers — List workers (for assignment dropdown)
const getWorkers = asyncHandler(async (req, res) => {
  const workers = await User.find({ role: 'worker', isActive: true }).select('name email phone city');
  return apiResponse(res, 200, true, 'Workers list', workers);
});

// @POST /api/users — Create staff/worker account (admin/nagarpalika)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, city, nagarPalikaId } = req.body;
  if (!name || !email || !password || !role) {
    return apiResponse(res, 400, false, 'Name, email, password, and role are required');
  }
  if (!['nagarpalika', 'worker', 'citizen'].includes(role)) {
    return apiResponse(res, 400, false, 'Invalid role');
  }
  const existing = await User.findOne({ email });
  if (existing) return apiResponse(res, 409, false, 'Email already registered');

  const user = await User.create({ name, email, phone, passwordHash: password, role, city, nagarPalikaId });
  logActivity({ userId: req.user._id, userEmail: req.user.email, action: 'USER_CREATE', resource: 'user', resourceId: user._id, details: { role, email } });
  return apiResponse(res, 201, true, 'User created', user);
});

// @PATCH /api/users/:id — Update user
const updateUser = asyncHandler(async (req, res) => {
  const { name, phone, city, isActive, role } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (city) updates.city = city;
  if (isActive !== undefined) updates.isActive = isActive;
  if (role && req.user.role === 'admin') updates.role = role;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash -refreshToken');
  if (!user) return apiResponse(res, 404, false, 'User not found');

  logActivity({ userId: req.user._id, userEmail: req.user.email, action: 'USER_UPDATE', resource: 'user', resourceId: user._id, details: updates });
  return apiResponse(res, 200, true, 'User updated', user);
});

// @DELETE /api/users/:id — Deactivate user (soft delete)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) return apiResponse(res, 404, false, 'User not found');
  logActivity({ userId: req.user._id, userEmail: req.user.email, action: 'USER_DEACTIVATE', resource: 'user', resourceId: user._id });
  return apiResponse(res, 200, true, 'User deactivated');
});

// @PATCH /api/users/me — Update own profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, city } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (city) updates.city = city;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-passwordHash -refreshToken');
  return apiResponse(res, 200, true, 'Profile updated', user);
});

module.exports = { getUsers, getWorkers, createUser, updateUser, deleteUser, updateProfile };
