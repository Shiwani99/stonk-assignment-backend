const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Role = sequelize.define(
    "Role",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
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
      muted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      banned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["userId", "channelId"],
        },
      ],
    }
  );

  return Role;
};
