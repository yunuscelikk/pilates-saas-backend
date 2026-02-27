'use strict';

const bcrypt = require('bcryptjs');

// Deterministic UUIDs
const STUDIO_ID = 'a0000000-0000-0000-0000-000000000001';
const OWNER_ID = 'b0000000-0000-0000-0000-000000000001';
const STAFF_ID = 'b0000000-0000-0000-0000-000000000002';
const MEMBER_IDS = [
  'c0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000004',
  'c0000000-0000-0000-0000-000000000005',
];
const TRAINER_IDS = [
  'd0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000002',
];
const CLASS_IDS = [
  'e0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000002',
  'e0000000-0000-0000-0000-000000000003',
];
const SESSION_IDS = [
  'f0000000-0000-0000-0000-000000000001',
  'f0000000-0000-0000-0000-000000000002',
  'f0000000-0000-0000-0000-000000000003',
  'f0000000-0000-0000-0000-000000000004',
  'f0000000-0000-0000-0000-000000000005',
];
const PLAN_IDS = [
  'aa000000-0000-0000-0000-000000000001',
  'aa000000-0000-0000-0000-000000000002',
];
const MEMBERSHIP_IDS = [
  'bb000000-0000-0000-0000-000000000001',
  'bb000000-0000-0000-0000-000000000002',
  'bb000000-0000-0000-0000-000000000003',
];
const BOOKING_IDS = [
  'cc000000-0000-0000-0000-000000000001',
  'cc000000-0000-0000-0000-000000000002',
  'cc000000-0000-0000-0000-000000000003',
];
const PAYMENT_IDS = [
  'dd000000-0000-0000-0000-000000000001',
  'dd000000-0000-0000-0000-000000000002',
  'dd000000-0000-0000-0000-000000000003',
];

const now = new Date();

module.exports = {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Studio
    await queryInterface.bulkInsert('studios', [{
      id: STUDIO_ID,
      name: 'Zen Pilates Studio',
      slug: 'zen-pilates',
      email: 'info@zenpilates.com',
      phone: '+90 555 123 4567',
      address: 'Istanbul, Turkey',
      is_active: true,
      settings: JSON.stringify({ timezone: 'Europe/Istanbul', currency: 'TRY' }),
      created_at: now,
      updated_at: now,
    }]);

    // Users
    await queryInterface.bulkInsert('users', [
      {
        id: OWNER_ID,
        studio_id: STUDIO_ID,
        email: 'owner@zenpilates.com',
        password: hashedPassword,
        first_name: 'Ayse',
        last_name: 'Yilmaz',
        role: 'owner',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: STAFF_ID,
        studio_id: STUDIO_ID,
        email: 'staff@zenpilates.com',
        password: hashedPassword,
        first_name: 'Mehmet',
        last_name: 'Kaya',
        role: 'staff',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    // Members
    await queryInterface.bulkInsert('members', [
      { id: MEMBER_IDS[0], studio_id: STUDIO_ID, first_name: 'Elif', last_name: 'Demir', email: 'elif@email.com', phone: '+90 555 001 0001', is_active: true, joined_at: '2025-01-15', created_at: now, updated_at: now },
      { id: MEMBER_IDS[1], studio_id: STUDIO_ID, first_name: 'Zeynep', last_name: 'Ozturk', email: 'zeynep@email.com', phone: '+90 555 001 0002', is_active: true, joined_at: '2025-02-10', created_at: now, updated_at: now },
      { id: MEMBER_IDS[2], studio_id: STUDIO_ID, first_name: 'Fatma', last_name: 'Celik', email: 'fatma@email.com', phone: '+90 555 001 0003', is_active: true, joined_at: '2025-03-05', created_at: now, updated_at: now },
      { id: MEMBER_IDS[3], studio_id: STUDIO_ID, first_name: 'Ali', last_name: 'Sahin', email: 'ali@email.com', phone: '+90 555 001 0004', is_active: true, joined_at: '2025-04-20', created_at: now, updated_at: now },
      { id: MEMBER_IDS[4], studio_id: STUDIO_ID, first_name: 'Emre', last_name: 'Arslan', email: 'emre@email.com', phone: '+90 555 001 0005', is_active: false, joined_at: '2025-05-01', created_at: now, updated_at: now },
    ]);

    // Trainers
    await queryInterface.bulkInsert('trainers', [
      { id: TRAINER_IDS[0], studio_id: STUDIO_ID, first_name: 'Selin', last_name: 'Acar', email: 'selin@zenpilates.com', phone: '+90 555 002 0001', specializations: JSON.stringify(['mat_pilates', 'reformer']), bio: 'Certified Pilates instructor with 8 years of experience', is_active: true, created_at: now, updated_at: now },
      { id: TRAINER_IDS[1], studio_id: STUDIO_ID, first_name: 'Can', last_name: 'Yildiz', email: 'can@zenpilates.com', phone: '+90 555 002 0002', specializations: JSON.stringify(['reformer', 'prenatal']), bio: 'Specializing in reformer and prenatal pilates', is_active: true, created_at: now, updated_at: now },
    ]);

    // Classes
    await queryInterface.bulkInsert('classes', [
      { id: CLASS_IDS[0], studio_id: STUDIO_ID, name: 'Mat Pilates', description: 'Classic mat-based pilates class', duration_minutes: 60, max_capacity: 12, class_type: 'group', is_active: true, created_at: now, updated_at: now },
      { id: CLASS_IDS[1], studio_id: STUDIO_ID, name: 'Reformer Pilates', description: 'Reformer machine-based pilates', duration_minutes: 55, max_capacity: 6, class_type: 'semi_private', is_active: true, created_at: now, updated_at: now },
      { id: CLASS_IDS[2], studio_id: STUDIO_ID, name: 'Private Session', description: 'One-on-one pilates session', duration_minutes: 50, max_capacity: 1, class_type: 'private', is_active: true, created_at: now, updated_at: now },
    ]);

    // Class Sessions
    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(now); dayAfter.setDate(dayAfter.getDate() + 2);

    await queryInterface.bulkInsert('class_sessions', [
      { id: SESSION_IDS[0], studio_id: STUDIO_ID, class_id: CLASS_IDS[0], trainer_id: TRAINER_IDS[0], start_time: new Date(tomorrow.setHours(9, 0, 0)), end_time: new Date(tomorrow.setHours(10, 0, 0)), status: 'scheduled', current_capacity: 2, created_at: now, updated_at: now },
      { id: SESSION_IDS[1], studio_id: STUDIO_ID, class_id: CLASS_IDS[0], trainer_id: TRAINER_IDS[0], start_time: new Date(tomorrow.setHours(11, 0, 0)), end_time: new Date(tomorrow.setHours(12, 0, 0)), status: 'scheduled', current_capacity: 0, created_at: now, updated_at: now },
      { id: SESSION_IDS[2], studio_id: STUDIO_ID, class_id: CLASS_IDS[1], trainer_id: TRAINER_IDS[1], start_time: new Date(tomorrow.setHours(14, 0, 0)), end_time: new Date(tomorrow.setHours(14, 55, 0)), status: 'scheduled', current_capacity: 1, created_at: now, updated_at: now },
      { id: SESSION_IDS[3], studio_id: STUDIO_ID, class_id: CLASS_IDS[1], trainer_id: TRAINER_IDS[1], start_time: new Date(dayAfter.setHours(9, 0, 0)), end_time: new Date(dayAfter.setHours(9, 55, 0)), status: 'scheduled', current_capacity: 0, created_at: now, updated_at: now },
      { id: SESSION_IDS[4], studio_id: STUDIO_ID, class_id: CLASS_IDS[2], trainer_id: TRAINER_IDS[0], start_time: new Date(dayAfter.setHours(11, 0, 0)), end_time: new Date(dayAfter.setHours(11, 50, 0)), status: 'scheduled', current_capacity: 0, created_at: now, updated_at: now },
    ]);

    // Membership Plans
    await queryInterface.bulkInsert('membership_plans', [
      { id: PLAN_IDS[0], studio_id: STUDIO_ID, name: '10 Class Pack', description: '10 group classes', plan_type: 'class_pack', classes_included: 10, duration_days: 90, price: 2500.00, currency: 'TRY', is_active: true, created_at: now, updated_at: now },
      { id: PLAN_IDS[1], studio_id: STUDIO_ID, name: 'Monthly Unlimited', description: 'Unlimited classes for 30 days', plan_type: 'unlimited', classes_included: null, duration_days: 30, price: 4000.00, currency: 'TRY', is_active: true, created_at: now, updated_at: now },
    ]);

    // Memberships
    await queryInterface.bulkInsert('memberships', [
      { id: MEMBERSHIP_IDS[0], studio_id: STUDIO_ID, member_id: MEMBER_IDS[0], membership_plan_id: PLAN_IDS[0], start_date: '2026-03-01', end_date: '2026-05-30', classes_remaining: 8, status: 'active', created_at: now, updated_at: now },
      { id: MEMBERSHIP_IDS[1], studio_id: STUDIO_ID, member_id: MEMBER_IDS[1], membership_plan_id: PLAN_IDS[1], start_date: '2026-03-01', end_date: '2026-03-31', classes_remaining: null, status: 'active', created_at: now, updated_at: now },
      { id: MEMBERSHIP_IDS[2], studio_id: STUDIO_ID, member_id: MEMBER_IDS[2], membership_plan_id: PLAN_IDS[0], start_date: '2026-02-01', end_date: '2026-05-01', classes_remaining: 3, status: 'active', created_at: now, updated_at: now },
    ]);

    // Bookings
    await queryInterface.bulkInsert('bookings', [
      { id: BOOKING_IDS[0], studio_id: STUDIO_ID, member_id: MEMBER_IDS[0], class_session_id: SESSION_IDS[0], status: 'confirmed', booked_at: now, created_at: now, updated_at: now },
      { id: BOOKING_IDS[1], studio_id: STUDIO_ID, member_id: MEMBER_IDS[1], class_session_id: SESSION_IDS[0], status: 'confirmed', booked_at: now, created_at: now, updated_at: now },
      { id: BOOKING_IDS[2], studio_id: STUDIO_ID, member_id: MEMBER_IDS[2], class_session_id: SESSION_IDS[2], status: 'confirmed', booked_at: now, created_at: now, updated_at: now },
    ]);

    // Payments
    await queryInterface.bulkInsert('payments', [
      { id: PAYMENT_IDS[0], studio_id: STUDIO_ID, member_id: MEMBER_IDS[0], membership_id: MEMBERSHIP_IDS[0], amount: 2500.00, currency: 'TRY', payment_method: 'credit_card', status: 'completed', payment_date: '2026-03-01', created_at: now, updated_at: now },
      { id: PAYMENT_IDS[1], studio_id: STUDIO_ID, member_id: MEMBER_IDS[1], membership_id: MEMBERSHIP_IDS[1], amount: 4000.00, currency: 'TRY', payment_method: 'bank_transfer', status: 'completed', payment_date: '2026-03-01', created_at: now, updated_at: now },
      { id: PAYMENT_IDS[2], studio_id: STUDIO_ID, member_id: MEMBER_IDS[2], membership_id: MEMBERSHIP_IDS[2], amount: 2500.00, currency: 'TRY', payment_method: 'cash', status: 'completed', payment_date: '2026-02-01', created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('payments', null, {});
    await queryInterface.bulkDelete('bookings', null, {});
    await queryInterface.bulkDelete('memberships', null, {});
    await queryInterface.bulkDelete('membership_plans', null, {});
    await queryInterface.bulkDelete('class_sessions', null, {});
    await queryInterface.bulkDelete('classes', null, {});
    await queryInterface.bulkDelete('trainers', null, {});
    await queryInterface.bulkDelete('members', null, {});
    await queryInterface.bulkDelete('refresh_tokens', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('studios', null, {});
  },
};
