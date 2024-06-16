const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Followers = sequelize.define("Followers", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    followerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    followingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

  return Followers;
};
