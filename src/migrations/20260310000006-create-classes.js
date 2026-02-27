'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('classes', {
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
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 60,
      },
      max_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      class_type: {
        type: Sequelize.ENUM('group', 'private', 'semi_private'),
        allowNull: false,
        defaultValue: 'group',
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

    await queryInterface.addIndex('classes', ['studio_id']);
    await queryInterface.addIndex('classes', ['studio_id', 'created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('classes');
  },
};
