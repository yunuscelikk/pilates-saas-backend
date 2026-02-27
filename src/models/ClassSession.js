module.exports = (sequelize, DataTypes) => {
  const ClassSession = sequelize.define('ClassSession', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studio_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    trainer_id: DataTypes.UUID,
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'scheduled',
    },
    current_capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    notes: DataTypes.TEXT,
  }, {
    tableName: 'class_sessions',
    underscored: true,
  });

  ClassSession.forStudio = function (studioId) {
    return this.scope({ where: { studio_id: studioId } });
  };

  ClassSession.associate = (models) => {
    ClassSession.belongsTo(models.Studio, { foreignKey: 'studio_id' });
    ClassSession.belongsTo(models.Class, { foreignKey: 'class_id' });
    ClassSession.belongsTo(models.Trainer, { foreignKey: 'trainer_id' });
    ClassSession.hasMany(models.Booking, { foreignKey: 'class_session_id' });
    ClassSession.hasMany(models.Attendance, { foreignKey: 'class_session_id' });
  };

  return ClassSession;
};
