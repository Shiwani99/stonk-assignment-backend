const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Role = sequelize.define("Role", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Profiles",
        key: "id",
      },
    },
    channelId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Channels",
        key: "id",
      },
    },
  });

  return Role;
};
