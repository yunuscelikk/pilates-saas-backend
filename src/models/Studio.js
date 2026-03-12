module.exports = (sequelize, DataTypes) => {
  const Studio = sequelize.define(
    "Studio",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.TEXT,
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      settings: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
    },
    {
      tableName: "studios",
      underscored: true,
    },
  );

  Studio.associate = (models) => {
    Studio.hasMany(models.User, { foreignKey: "studio_id" });
    Studio.hasMany(models.Member, { foreignKey: "studio_id" });
    Studio.hasMany(models.Trainer, { foreignKey: "studio_id" });
    Studio.hasMany(models.Class, { foreignKey: "studio_id" });
    Studio.hasMany(models.MembershipPlan, { foreignKey: "studio_id" });
    Studio.hasMany(models.ClassSession, { foreignKey: "studio_id" });
    Studio.hasMany(models.Booking, { foreignKey: "studio_id" });
    Studio.hasMany(models.Membership, { foreignKey: "studio_id" });
    Studio.hasMany(models.Payment, { foreignKey: "studio_id" });
    Studio.hasMany(models.Attendance, { foreignKey: "studio_id" });
    Studio.hasMany(models.Notification, { foreignKey: "studio_id" });
    Studio.hasMany(models.Message, { foreignKey: "studio_id" });
    Studio.hasOne(models.Subscription, { foreignKey: "studio_id" });
  };

  return Studio;
};
