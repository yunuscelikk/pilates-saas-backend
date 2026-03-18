module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define('Otp', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    studio_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'otps',
    underscored: true,
    updatedAt: false,
  });

  Otp.associate = (models) => {
    Otp.belongsTo(models.Studio, { foreignKey: 'studio_id' });
  };

  return Otp;
};
