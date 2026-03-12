module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define(
    "Subscription",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      studio_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      plan_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "trialing",
          "active",
          "past_due",
          "canceled",
          "expired",
        ),
        allowNull: false,
        defaultValue: "trialing",
      },
      trial_ends_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      current_period_start: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      current_period_end: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancel_at_period_end: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      iyzico_customer_reference_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      iyzico_subscription_reference_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      iyzico_parent_reference_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      canceled_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "subscriptions",
      underscored: true,
    },
  );

  Subscription.associate = (models) => {
    Subscription.belongsTo(models.Studio, { foreignKey: "studio_id" });
    Subscription.belongsTo(models.Plan, { foreignKey: "plan_id" });
  };

  return Subscription;
};
