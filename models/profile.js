const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const Profile = sequelize.define(
    "Profile",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      fullName: DataTypes.STRING,
      username: {
        type: DataTypes.STRING,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: DataTypes.STRING,
      avatar: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      twoFactorAuthEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      twoFactorAuthCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      hooks: {
        beforeCreate: async (profile) => {
          if (profile.password) {
            const salt = await bcrypt.genSalt(10);
            profile.password = await bcrypt.hash(profile.password, salt);
          }
        },
      },
    }
  );

  Profile.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  return Profile;
};
