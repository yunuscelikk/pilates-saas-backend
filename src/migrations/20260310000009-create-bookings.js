'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookings', {
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
      status: {
        type: Sequelize.ENUM('confirmed', 'cancelled', 'waitlisted', 'no_show'),
        defaultValue: 'confirmed',
      },
      booked_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      cancelled_at: {
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

    await queryInterface.addIndex('bookings', ['studio_id']);
    await queryInterface.addIndex('bookings', ['studio_id', 'created_at']);
    await queryInterface.addIndex('bookings', ['member_id', 'class_session_id'], { unique: true });
    await queryInterface.addIndex('bookings', ['class_session_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('bookings');
  },
};
