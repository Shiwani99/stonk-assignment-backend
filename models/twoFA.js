module.exports = (sequelize, DataTypes) => {
  const twoFA = sequelize.define("twoFA", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    twoFactorAuthEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    twoFactorAuthCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return twoFA;
};
