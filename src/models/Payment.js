module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
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
    membership_id: DataTypes.UUID,
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'TRY',
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'credit_card', 'bank_transfer', 'other'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'completed',
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    notes: DataTypes.TEXT,
  }, {
    tableName: 'payments',
    underscored: true,
  });

  Payment.forStudio = function (studioId) {
    return this.scope({ where: { studio_id: studioId } });
  };

  Payment.associate = (models) => {
    Payment.belongsTo(models.Studio, { foreignKey: 'studio_id' });
    Payment.belongsTo(models.Member, { foreignKey: 'member_id' });
    Payment.belongsTo(models.Membership, { foreignKey: 'membership_id' });
  };

  return Payment;
};
