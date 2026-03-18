const router = require('express').Router();
const resolveStudio = require('../middleware/resolveStudio');
const authenticateMember = require('../middleware/authenticateMember');
const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/response');

const publicStudioService = require('../services/publicStudio.service');
const publicAuthService = require('../services/publicAuth.service');
const publicBookingService = require('../services/publicBooking.service');

// All routes under /:studioSlug resolve the studio first
router.use('/:studioSlug', resolveStudio);

// --- Public (no auth) ---

router.get('/:studioSlug', catchAsync(async (req, res) => {
  const studio = await publicStudioService.getStudioBySlug(req.params.studioSlug);
  success(res, studio);
}));

router.get('/:studioSlug/classes', catchAsync(async (req, res) => {
  const classes = await publicStudioService.getClasses(req.studioId);
  success(res, classes);
}));

router.get('/:studioSlug/sessions', catchAsync(async (req, res) => {
  const { date, startDate, endDate } = req.query;
  const sessions = await publicStudioService.getSessions(req.studioId, { date, startDate, endDate });
  success(res, sessions);
}));

router.get('/:studioSlug/sessions/:id', catchAsync(async (req, res) => {
  const session = await publicStudioService.getSessionById(req.studioId, req.params.id);
  success(res, session);
}));

// --- OTP Auth ---

router.post('/:studioSlug/auth/send-otp', catchAsync(async (req, res) => {
  const result = await publicAuthService.sendOtp(req.studioId, req.body.phone);
  success(res, result);
}));

router.post('/:studioSlug/auth/verify-otp', catchAsync(async (req, res) => {
  const result = await publicAuthService.verifyOtp(req.studioId, req.body.phone, req.body.code);
  success(res, result);
}));

router.post('/:studioSlug/auth/refresh', catchAsync(async (req, res) => {
  const tokens = await publicAuthService.refreshMemberToken(req.body.refreshToken);
  success(res, tokens);
}));

// --- Member auth required ---

router.use('/:studioSlug/me', authenticateMember);
router.use('/:studioSlug/my-bookings', authenticateMember);
router.use('/:studioSlug/book', authenticateMember);
router.use('/:studioSlug/my-memberships', authenticateMember);
router.use('/:studioSlug/my-payments', authenticateMember);

router.get('/:studioSlug/me', catchAsync(async (req, res) => {
  const member = await publicAuthService.memberMe(req.memberId);
  success(res, member);
}));

router.get('/:studioSlug/my-bookings', catchAsync(async (req, res) => {
  const { upcoming, past } = req.query;
  const bookings = await publicBookingService.getMyBookings(req.studioId, req.memberId, {
    upcoming: upcoming === 'true',
    past: past === 'true',
  });
  success(res, bookings);
}));

router.post('/:studioSlug/book/:sessionId', catchAsync(async (req, res) => {
  const booking = await publicBookingService.createBooking(req.studioId, req.memberId, req.params.sessionId);
  success(res, booking, 201);
}));

router.delete('/:studioSlug/book/:bookingId', catchAsync(async (req, res) => {
  const booking = await publicBookingService.cancelBooking(req.studioId, req.memberId, req.params.bookingId);
  success(res, booking);
}));

router.get('/:studioSlug/my-memberships', catchAsync(async (req, res) => {
  const memberships = await publicBookingService.getMyMemberships(req.studioId, req.memberId);
  success(res, memberships);
}));

router.get('/:studioSlug/my-payments', catchAsync(async (req, res) => {
  const payments = await publicBookingService.getMyPayments(req.studioId, req.memberId);
  success(res, payments);
}));

module.exports = router;
