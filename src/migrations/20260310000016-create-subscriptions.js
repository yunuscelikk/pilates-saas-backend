"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("subscriptions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      studio_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "studios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      plan_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "plans",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      status: {
        type: Sequelize.ENUM(
          "trialing",
          "active",
          "past_due",
          "canceled",
          "expired",
        ),
        allowNull: false,
        defaultValue: "trialing",
      },
      trial_ends_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      current_period_start: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      current_period_end: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cancel_at_period_end: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      iyzico_customer_reference_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      iyzico_subscription_reference_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      iyzico_parent_reference_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      canceled_at: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.dropTable("subscriptions");
  },
};
