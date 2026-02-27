module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studio_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sender_type: {
      type: DataTypes.ENUM('user', 'member'),
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    recipient_type: {
      type: DataTypes.ENUM('user', 'member'),
      allowNull: false,
    },
    recipient_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subject: DataTypes.STRING,
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    read_at: DataTypes.DATE,
  }, {
    tableName: 'messages',
    underscored: true,
  });

  Message.forStudio = function (studioId) {
    return this.scope({ where: { studio_id: studioId } });
  };

  Message.associate = (models) => {
    Message.belongsTo(models.Studio, { foreignKey: 'studio_id' });
  };

  return Message;
};
