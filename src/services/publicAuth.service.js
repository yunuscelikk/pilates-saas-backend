const { Op } = require('sequelize');
const { Otp, Member, Membership, MembershipPlan } = require('../models');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

const generateMemberTokens = (member) => {
  const payload = {
    memberId: member.id,
    studioId: member.studio_id,
    type: 'member',
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
};

const sendOtp = async (studioId, phone) => {
  if (!phone) {
    throw AppError.badRequest('Phone number is required');
  }

  const member = await Member.findOne({
    where: { studio_id: studioId, phone, is_active: true },
  });
  if (!member) {
    throw AppError.notFound('No member found with this phone number');
  }

  // Rate limit: max 5 OTPs per phone per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await Otp.count({
    where: {
      phone,
      studio_id: studioId,
      created_at: { [Op.gte]: oneHourAgo },
    },
  });
  if (recentCount >= 5) {
    throw AppError.badRequest('Too many OTP requests. Please try again later.');
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.create({
    phone,
    code,
    studio_id: studioId,
    expires_at: expiresAt,
  });

  // In dev, log OTP to console (no SMS provider yet)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[OTP] Studio: ${studioId} | Phone: ${phone} | Code: ${code}`);
  }

  return { message: 'OTP sent successfully' };
};

const verifyOtp = async (studioId, phone, code) => {
  if (!phone || !code) {
    throw AppError.badRequest('Phone and code are required');
  }

  const otp = await Otp.findOne({
    where: {
      phone,
      code,
      studio_id: studioId,
      verified: false,
      expires_at: { [Op.gt]: new Date() },
    },
    order: [['created_at', 'DESC']],
  });

  if (!otp) {
    throw AppError.unauthorized('Invalid or expired OTP');
  }

  await otp.update({ verified: true });

  const member = await Member.findOne({
    where: { studio_id: studioId, phone, is_active: true },
  });
  if (!member) {
    throw AppError.notFound('Member not found');
  }

  const tokens = generateMemberTokens(member);

  return {
    member: {
      id: member.id,
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone,
    },
    ...tokens,
  };
};

const refreshMemberToken = async (refreshTokenStr) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshTokenStr);
  } catch {
    throw AppError.unauthorized('Invalid refresh token');
  }

  if (decoded.type !== 'member') {
    throw AppError.unauthorized('Invalid token type');
  }

  const member = await Member.findByPk(decoded.memberId);
  if (!member || !member.is_active) {
    throw AppError.unauthorized('Member not found or inactive');
  }

  const tokens = generateMemberTokens(member);
  return tokens;
};

const memberMe = async (memberId) => {
  const member = await Member.findByPk(memberId, {
    attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'gender', 'joined_at'],
    include: [
      {
        model: Membership,
        where: { status: 'active' },
        required: false,
        include: [{ model: MembershipPlan, attributes: ['id', 'name', 'plan_type', 'classes_included', 'duration_days'] }],
      },
    ],
  });
  if (!member) throw AppError.notFound('Member not found');
  return member;
};

module.exports = { sendOtp, verifyOtp, refreshMemberToken, memberMe };
