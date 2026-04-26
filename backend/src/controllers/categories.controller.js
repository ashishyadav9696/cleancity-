const Category = require('../models/Category');
const { asyncHandler } = require('../middleware/errorHandler');
const { logActivity, apiResponse } = require('../utils/helpers');

// @GET /api/categories (public)
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  return apiResponse(res, 200, true, 'Categories', categories);
});

// @POST /api/categories (admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, icon, description, color } = req.body;
  if (!name) return apiResponse(res, 400, false, 'Name is required');
  const category = await Category.create({ name, icon, description, color });
  logActivity({ userId: req.user._id, action: 'CATEGORY_CREATE', resource: 'category', resourceId: category._id });
  return apiResponse(res, 201, true, 'Category created', category);
});

// @PATCH /api/categories/:id (admin)
const updateCategory = asyncHandler(async (req, res) => {
  const { name, icon, description, color, isActive } = req.body;
  const category = await Category.findByIdAndUpdate(req.params.id, { name, icon, description, color, isActive }, { new: true });
  if (!category) return apiResponse(res, 404, false, 'Category not found');
  logActivity({ userId: req.user._id, action: 'CATEGORY_UPDATE', resource: 'category', resourceId: category._id });
  return apiResponse(res, 200, true, 'Category updated', category);
});

// @DELETE /api/categories/:id (admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) return apiResponse(res, 404, false, 'Category not found');
  return apiResponse(res, 200, true, 'Category deactivated');
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
