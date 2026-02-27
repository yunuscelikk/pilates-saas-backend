module.exports = (sequelize, DataTypes) => {
  const Trainer = sequelize.define('Trainer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studio_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    specializations: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    bio: DataTypes.TEXT,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'trainers',
    underscored: true,
  });

  Trainer.forStudio = function (studioId) {
    return this.scope({ where: { studio_id: studioId } });
  };

  Trainer.associate = (models) => {
    Trainer.belongsTo(models.Studio, { foreignKey: 'studio_id' });
    Trainer.hasMany(models.ClassSession, { foreignKey: 'trainer_id' });
  };

  return Trainer;
};
