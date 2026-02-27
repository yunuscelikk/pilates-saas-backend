'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
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
      sender_type: {
        type: Sequelize.ENUM('user', 'member'),
        allowNull: false,
      },
      sender_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      recipient_type: {
        type: Sequelize.ENUM('user', 'member'),
        allowNull: false,
      },
      recipient_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      read_at: {
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

    await queryInterface.addIndex('messages', ['studio_id']);
    await queryInterface.addIndex('messages', ['studio_id', 'created_at']);
    await queryInterface.addIndex('messages', ['sender_type', 'sender_id']);
    await queryInterface.addIndex('messages', ['recipient_type', 'recipient_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('messages');
  },
};
