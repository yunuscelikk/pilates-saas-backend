module.exports = (sequelize, DataTypes) => {
  const MembershipPlan = sequelize.define('MembershipPlan', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studio_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    plan_type: {
      type: DataTypes.ENUM('class_pack', 'time_based', 'unlimited'),
      allowNull: false,
    },
    classes_included: DataTypes.INTEGER,
    duration_days: DataTypes.INTEGER,
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'TRY',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'membership_plans',
    underscored: true,
  });

  MembershipPlan.forStudio = function (studioId) {
    return this.scope({ where: { studio_id: studioId } });
  };

  MembershipPlan.associate = (models) => {
    MembershipPlan.belongsTo(models.Studio, { foreignKey: 'studio_id' });
    MembershipPlan.hasMany(models.Membership, { foreignKey: 'membership_plan_id' });
  };

  return MembershipPlan;
};
