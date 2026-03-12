module.exports = (sequelize, DataTypes) => {
  const Plan = sequelize.define(
    "Plan",
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
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      billing_interval: {
        type: DataTypes.ENUM("monthly", "yearly"),
        allowNull: false,
        defaultValue: "monthly",
      },
      max_members: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      max_classes: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      max_staff: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      features: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      iyzico_product_reference_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      iyzico_pricing_plan_reference_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "plans",
      underscored: true,
    },
  );

  Plan.associate = (models) => {
    Plan.hasMany(models.Subscription, { foreignKey: "plan_id" });
  };

  return Plan;
};
