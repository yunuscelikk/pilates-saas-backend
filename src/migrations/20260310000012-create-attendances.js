'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendances', {
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
      member_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'members', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      class_session_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'class_sessions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      check_in_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      check_out_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('checked_in', 'checked_out', 'no_show'),
        defaultValue: 'checked_in',
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

    await queryInterface.addIndex('attendances', ['studio_id']);
    await queryInterface.addIndex('attendances', ['studio_id', 'created_at']);
    await queryInterface.addIndex('attendances', ['member_id', 'class_session_id'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('attendances');
  },
};
