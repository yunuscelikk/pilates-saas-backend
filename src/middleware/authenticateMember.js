const { verifyAccessToken } = require('../utils/jwt');
const { Member } = require('../models');
const AppError = require('../utils/AppError');

const authenticateMember = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (decoded.type !== 'member') {
      throw AppError.unauthorized('Invalid token type');
    }

    if (decoded.studioId !== req.studioId) {
      throw AppError.unauthorized('Token does not match studio');
    }

    const member = await Member.findByPk(decoded.memberId);
    if (!member || !member.is_active) {
      throw AppError.unauthorized('Member not found or inactive');
    }

    if (member.studio_id !== req.studioId) {
      throw AppError.unauthorized('Cross-tenant access denied');
    }

    req.member = member;
    req.memberId = member.id;
    next();
  } catch (error) {
    if (error.isOperational) return next(error);
    next(AppError.unauthorized('Invalid token'));
  }
};

module.exports = authenticateMember;
