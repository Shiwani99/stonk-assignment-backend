const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { Profile, Channel, Message, Role } = require("./models");
require("dotenv").config();

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  const connectedUsers = {};

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error("Authentication error"));
      }
    } else {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    connectedUsers[userId] = socket;

    socket.on("joinChannel", async ({ channelId }) => {
      const channel = await Channel.findByPk(channelId);
      if (!channel || channel.isSuspended) {
        return socket.emit("error", {
          message: "Channel not found or suspended",
        });
      }

      socket.join(channelId);
      const messages = await Message.findAll({ where: { channelId } });
      socket.emit("channelMessages", messages);
    });

    socket.on("sendMessage", async ({ channelId, message }) => {
      const channel = await Channel.findByPk(channelId);
      if (channel.isSuspended) {
        return socket.emit("error", { message: "Channel is suspended" });
      }

      const newMessage = await Message.create({
        userId: socket.user.id,
        channelId,
        content: message,
      });
      io.to(channelId).emit("newMessage", newMessage);
    });

    socket.on(
      "performAction",
      async ({ action, targetUsername, channelId }) => {
        const role = await Role.findOne({
          where: { userId: socket.user.id, channelId: channelId },
        });

        if (!role) return;

        const targetUser = await Profile.findOne({
          where: { username: targetUsername },
        });
        if (!targetUser) return;

        const isAdminAction = ["/mute", "/unmute", "/ban", "/unban"].includes(
          action
        );
        const isHostAction =
          action.startsWith("/set ") ||
          action === "/set admin" ||
          action === "/unset admin";
        const isSuperAdminAction = action === "/suspend";

        if (
          role.name === "SUPERADMIN" ||
          (role.name === "HOST" && (isAdminAction || isHostAction)) ||
          (role.name === "ADMIN" && isAdminAction)
        ) {
          performChannelAction(action, targetUser.id, channelId);
        }
      }
    );

    socket.on("disconnect", () => {
      delete connectedUsers[userId];
    });
  });

  const performChannelAction = async (action, targetUserId, channelId) => {
    switch (action) {
      case "/mute":
        await Role.upsert({ userId: targetUserId, channelId, muted: true });
        io.to(channelId).emit("userMuted", { userId: targetUserId });
        break;
      case "/unmute":
        await Role.upsert({ userId: targetUserId, channelId, muted: false });
        io.to(channelId).emit("userUnmuted", { userId: targetUserId });
        break;
      case "/ban":
        await Role.upsert({ userId: targetUserId, channelId, banned: true });
        io.to(channelId).emit("userBanned", { userId: targetUserId });
        break;
      case "/unban":
        await Role.upsert({ userId: targetUserId, channelId, banned: false });
        io.to(channelId).emit("userUnbanned", { userId: targetUserId });
        break;
      case "/set admin":
        await Role.upsert({ name: "ADMIN", userId: targetUserId, channelId });
        io.to(channelId).emit("adminSet", { userId: targetUserId });
        break;
      case "/unset admin":
        await Role.upsert({ name: null, userId: targetUserId, channelId });
        io.to(channelId).emit("adminUnset", { userId: targetUserId });
        break;
      case "/suspend":
        console.log("here");
        await Channel.update({ suspended: true }, { where: { id: channelId } });
        io.to(channelId).emit("channelSuspended", { channelId });
        break;
    }

    if (action.startsWith("/set title")) {
      const title = action.split('"')[1];
      await Channel.update({ title: title }, { where: { id: channelId } });
      io.to(channelId).emit("channelTitleUpdated", { title });
    } else if (action.startsWith("/set description")) {
      const description = action.split('"')[1];
      await Channel.update({ description }, { where: { id: channelId } });
      io.to(channelId).emit("channelDescriptionUpdated", { description });
    }
  };
};
