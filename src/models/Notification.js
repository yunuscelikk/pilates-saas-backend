module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studio_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: DataTypes.UUID,
    member_id: DataTypes.UUID,
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: DataTypes.TEXT,
    type: {
      type: DataTypes.ENUM('info', 'warning', 'reminder', 'system'),
      defaultValue: 'info',
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    read_at: DataTypes.DATE,
  }, {
    tableName: 'notifications',
    underscored: true,
  });

  Notification.forStudio = function (studioId) {
    return this.scope({ where: { studio_id: studioId } });
  };

  Notification.associate = (models) => {
    Notification.belongsTo(models.Studio, { foreignKey: 'studio_id' });
    Notification.belongsTo(models.User, { foreignKey: 'user_id' });
    Notification.belongsTo(models.Member, { foreignKey: 'member_id' });
  };

  return Notification;
};
