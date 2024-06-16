const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Channel = sequelize.define("Channel", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

  Channel.associate = (models) => {
    Channel.belongsTo(models.Profile, { foreignKey: "ownerId", as: "owner" });
  };

  return Channel;
};
