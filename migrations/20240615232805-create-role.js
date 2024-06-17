"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Roles", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Profiles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      channelId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Channels",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      muted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      banned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addConstraint("Roles", {
      fields: ["userId", "channelId"],
      type: "unique",
      name: "unique_user_channel",
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("Roles", "unique_user_channel");
    await queryInterface.dropTable("Roles");
  },
};
