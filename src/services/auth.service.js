const { sequelize, Studio, User, RefreshToken } = require('../models');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

const generateTokens = async (user) => {
  const payload = { userId: user.id, studioId: user.studio_id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    user_id: user.id,
    token: refreshToken,
    expires_at: expiresAt,
  });

  return { accessToken, refreshToken };
};

const register = async (data) => {
  const existingStudio = await Studio.findOne({ where: { slug: data.studioSlug } });
  if (existingStudio) {
    throw AppError.conflict('Studio slug already taken');
  }

  const result = await sequelize.transaction(async (t) => {
    const studio = await Studio.create({
      name: data.studioName,
      slug: data.studioSlug,
    }, { transaction: t });

    const user = await User.create({
      studio_id: studio.id,
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      role: 'owner',
    }, { transaction: t });

    return { studio, user };
  });

  const tokens = await generateTokens(result.user);
  return { user: result.user.toJSON(), studio: result.studio, ...tokens };
};

const login = async ({ email, password, studioSlug }) => {
  const where = { email };
  const include = [{ model: Studio }];

  if (studioSlug) {
    include[0].where = { slug: studioSlug };
  }

  const user = await User.findOne({ where, include });
  if (!user) {
    throw AppError.unauthorized('Invalid credentials');
  }

  if (!user.is_active) {
    throw AppError.unauthorized('Account is inactive');
  }

  const isValid = await user.validatePassword(password);
  if (!isValid) {
    throw AppError.unauthorized('Invalid credentials');
  }

  const tokens = await generateTokens(user);
  return { user: user.toJSON(), ...tokens };
};

const refresh = async (refreshTokenStr) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshTokenStr);
  } catch {
    throw AppError.unauthorized('Invalid refresh token');
  }

  const storedToken = await RefreshToken.findOne({
    where: { token: refreshTokenStr },
  });

  if (!storedToken || storedToken.revoked_at || storedToken.expires_at < new Date()) {
    throw AppError.unauthorized('Refresh token is invalid or expired');
  }

  // Revoke old token (rotation)
  await storedToken.update({ revoked_at: new Date() });

  const user = await User.findByPk(decoded.userId);
  if (!user || !user.is_active) {
    throw AppError.unauthorized('User not found or inactive');
  }

  const tokens = await generateTokens(user);
  return { user: user.toJSON(), ...tokens };
};

const logout = async (refreshTokenStr) => {
  if (!refreshTokenStr) return;
  const token = await RefreshToken.findOne({ where: { token: refreshTokenStr } });
  if (token) {
    await token.update({ revoked_at: new Date() });
  }
};

const me = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [{ model: Studio }],
  });
  if (!user) throw AppError.notFound('User not found');
  return user.toJSON();
};

module.exports = { register, login, refresh, logout, me };
