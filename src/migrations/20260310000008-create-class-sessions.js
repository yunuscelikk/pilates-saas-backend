'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('class_sessions', {
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
      class_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'classes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      trainer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'trainers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'scheduled',
      },
      current_capacity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      notes: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('class_sessions', ['studio_id']);
    await queryInterface.addIndex('class_sessions', ['studio_id', 'created_at']);
    await queryInterface.addIndex('class_sessions', ['studio_id', 'start_time']);
    await queryInterface.addIndex('class_sessions', ['class_id']);
    await queryInterface.addIndex('class_sessions', ['trainer_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('class_sessions');
  },
};
