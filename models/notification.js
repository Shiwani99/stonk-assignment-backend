const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Notification = sequelize.define("Notification", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    registrationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.Profile, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return Notification;
};
