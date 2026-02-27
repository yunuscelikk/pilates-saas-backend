module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
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
    status: {
      type: DataTypes.ENUM('confirmed', 'cancelled', 'waitlisted', 'no_show'),
      defaultValue: 'confirmed',
    },
    booked_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    cancelled_at: DataTypes.DATE,
  }, {
    tableName: 'bookings',
    underscored: true,
  });

  Booking.forStudio = function (studioId) {
    return this.scope({ where: { studio_id: studioId } });
  };

  Booking.associate = (models) => {
    Booking.belongsTo(models.Studio, { foreignKey: 'studio_id' });
    Booking.belongsTo(models.Member, { foreignKey: 'member_id' });
    Booking.belongsTo(models.ClassSession, { foreignKey: 'class_session_id' });
  };

  return Booking;
};
