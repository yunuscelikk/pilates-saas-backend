"use strict";

const { v4: uuidv4 } = require("uuid");

const plans = [
  {
    id: uuidv4(),
    name: "Starter",
    slug: "starter",
    price: 499.0,
    billing_interval: "monthly",
    max_members: 50,
    max_classes: 5,
    max_staff: 1,
    features: JSON.stringify({
      sms_notifications: false,
      advanced_reports: false,
      api_access: false,
      custom_branding: false,
    }),
    is_active: true,
    sort_order: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: uuidv4(),
    name: "Professional",
    slug: "professional",
    price: 999.0,
    billing_interval: "monthly",
    max_members: null,
    max_classes: null,
    max_staff: 5,
    features: JSON.stringify({
      sms_notifications: true,
      advanced_reports: true,
      api_access: false,
      custom_branding: false,
    }),
    is_active: true,
    sort_order: 2,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: uuidv4(),
    name: "Enterprise",
    slug: "enterprise",
    price: 1999.0,
    billing_interval: "monthly",
    max_members: null,
    max_classes: null,
    max_staff: null,
    features: JSON.stringify({
      sms_notifications: true,
      advanced_reports: true,
      api_access: true,
      custom_branding: true,
    }),
    is_active: true,
    sort_order: 3,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("plans", plans);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("plans", {
      slug: ["starter", "professional", "enterprise"],
    });
  },
};
