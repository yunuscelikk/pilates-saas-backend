module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studio_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    member_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    class_session_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    check_in_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    check_out_time: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM('checked_in', 'checked_out', 'no_show'),
      defaultValue: 'checked_in',
    },
  }, {
    tableName: 'attendances',
    underscored: true,
  });

  Attendance.forStudio = function (studioId) {
    return this.scope({ where: { studio_id: studioId } });
  };

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Studio, { foreignKey: 'studio_id' });
    Attendance.belongsTo(models.Member, { foreignKey: 'member_id' });
    Attendance.belongsTo(models.ClassSession, { foreignKey: 'class_session_id' });
  };

  return Attendance;
};
