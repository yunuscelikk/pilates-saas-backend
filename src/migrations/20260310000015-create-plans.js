"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("plans", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      billing_interval: {
        type: Sequelize.ENUM("monthly", "yearly"),
        allowNull: false,
        defaultValue: "monthly",
      },
      max_members: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      max_classes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      max_staff: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      features: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      iyzico_product_reference_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      iyzico_pricing_plan_reference_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("plans");
  },
};
