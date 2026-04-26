const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../middleware/errorHandler');
const { logActivity, createNotification, apiResponse } = require('../utils/helpers');
const { sendWelcomeEmail } = require('../services/mail.service');

// @POST /api/auth/register  — Citizen self-registration
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, city } = req.body;
  if (!name || !email || !password) {
    return apiResponse(res, 400, false, 'Name, email, and password are required');
  }
  const existing = await User.findOne({ email });
  if (existing) return apiResponse(res, 409, false, 'Email already registered');

  const user = await User.create({ name, email, phone, passwordHash: password, city, role: 'citizen' });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user).catch(() => {});
  logActivity({ userId: user._id, userEmail: user.email, action: 'USER_REGISTER', resource: 'user', resourceId: user._id });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return apiResponse(res, 201, true, 'Registration successful', { accessToken, refreshToken, user });
});

// @POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return apiResponse(res, 400, false, 'Email and password required');

  const user = await User.findOne({ email });
  if (!user || !user.isActive) return apiResponse(res, 401, false, 'Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return apiResponse(res, 401, false, 'Invalid credentials');

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  logActivity({ userId: user._id, userEmail: user.email, action: 'USER_LOGIN', resource: 'user', resourceId: user._id });

  return apiResponse(res, 200, true, 'Login successful', { accessToken, refreshToken, user });
});

// @POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return apiResponse(res, 400, false, 'Refresh token required');

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'cleancity_refresh_secret');
  } catch {
    return apiResponse(res, 401, false, 'Invalid or expired refresh token');
  }

  const user = await User.findOne({ _id: decoded.id, refreshToken });
  if (!user) return apiResponse(res, 401, false, 'Invalid refresh token');

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return apiResponse(res, 200, true, 'Token refreshed', { accessToken: newAccessToken, refreshToken: newRefreshToken });
});

// @POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
  }
  return apiResponse(res, 200, true, 'Logged out successfully');
});

// @GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  return apiResponse(res, 200, true, 'User profile', req.user);
});

module.exports = { register, login, refresh, logout, getMe };
