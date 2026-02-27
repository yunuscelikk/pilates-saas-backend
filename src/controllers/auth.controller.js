const catchAsync = require('../utils/catchAsync');
const { success, created } = require('../utils/response');
const authService = require('../services/auth.service');

const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  created(res, result);
});

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  success(res, result);
});

const refresh = catchAsync(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  success(res, result);
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  success(res, { message: 'Logged out successfully' });
});

const getMe = catchAsync(async (req, res) => {
  const result = await authService.me(req.user.id);
  success(res, result);
});

module.exports = { register, login, refresh, logout, getMe };
