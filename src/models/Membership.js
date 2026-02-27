module.exports = (sequelize, DataTypes) => {
  const Membership = sequelize.define('Membership', {
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
    membership_plan_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: DataTypes.DATEONLY,
    classes_remaining: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM('active', 'expired', 'cancelled', 'frozen'),
      defaultValue: 'active',
    },
  }, {
    tableName: 'memberships',
    underscored: true,
    paranoid: true,
  });

  Membership.forStudio = function (studioId) {
    return this.scope({ where: { studio_id: studioId } });
  };

  Membership.associate = (models) => {
    Membership.belongsTo(models.Studio, { foreignKey: 'studio_id' });
    Membership.belongsTo(models.Member, { foreignKey: 'member_id' });
    Membership.belongsTo(models.MembershipPlan, { foreignKey: 'membership_plan_id' });
    Membership.hasMany(models.Payment, { foreignKey: 'membership_id' });
  };

  return Membership;
};
