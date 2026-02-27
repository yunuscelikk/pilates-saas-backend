module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
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
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
    },
    max_capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    class_type: {
      type: DataTypes.ENUM('group', 'private', 'semi_private'),
      allowNull: false,
      defaultValue: 'group',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'classes',
    underscored: true,
  });

  Class.forStudio = function (studioId) {
    return this.scope({ where: { studio_id: studioId } });
  };

  Class.associate = (models) => {
    Class.belongsTo(models.Studio, { foreignKey: 'studio_id' });
    Class.hasMany(models.ClassSession, { foreignKey: 'class_id' });
  };

  return Class;
};
