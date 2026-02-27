'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('membership_plans', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      studio_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'studios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      plan_type: {
        type: Sequelize.ENUM('class_pack', 'time_based', 'unlimited'),
        allowNull: false,
      },
      classes_included: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      duration_days: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'TRY',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    await queryInterface.addIndex('membership_plans', ['studio_id']);
    await queryInterface.addIndex('membership_plans', ['studio_id', 'created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('membership_plans');
  },
};
