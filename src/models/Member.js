module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studio_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_of_birth: DataTypes.DATEONLY,
    gender: DataTypes.ENUM('male', 'female', 'other'),
    emergency_contact_name: DataTypes.STRING,
    emergency_contact_phone: DataTypes.STRING,
    notes: DataTypes.TEXT,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    joined_at: DataTypes.DATEONLY,
  }, {
    tableName: 'members',
    underscored: true,
    paranoid: true,
  });

  Member.forStudio = function (studioId) {
    return this.scope({ where: { studio_id: studioId } });
  };

  Member.associate = (models) => {
    Member.belongsTo(models.Studio, { foreignKey: 'studio_id' });
    Member.hasMany(models.Booking, { foreignKey: 'member_id' });
    Member.hasMany(models.Membership, { foreignKey: 'member_id' });
    Member.hasMany(models.Payment, { foreignKey: 'member_id' });
    Member.hasMany(models.Attendance, { foreignKey: 'member_id' });
    Member.hasMany(models.Notification, { foreignKey: 'member_id' });
  };

  return Member;
};
