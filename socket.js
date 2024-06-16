const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { Profile, Channel, Message, Role } = require("../models");
require("dotenv").config();

const io = new Server(3000, {
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
    socket.join(channelId);
    const messages = await Message.findAll({ where: { channelId } });
    socket.emit("channelMessages", messages);
  });

  socket.on("sendMessage", async ({ channelId, message }) => {
    const newMessage = await Message.create({
      userId: socket.user.id,
      channelId,
      content: message,
    });
    io.to(channelId).emit("newMessage", newMessage);
  });

  socket.on("performAction", async ({ action, targetUserId, channelId }) => {
    const role = await Role.findOne({
      where: { userId: socket.user.id, channelId },
    });

    if (!role) return;

    if (
      role.name === "SUPERADMIN" ||
      (role.name === "HOST" && action.startsWith("/set "))
    ) {
      performChannelAction(action, targetUserId, channelId);
    } else if (
      role.name === "ADMIN" &&
      ["/mute", "/unmute", "/ban", "/unban"].includes(action)
    ) {
      performChannelAction(action, targetUserId, channelId);
    }
  });

  socket.on("disconnect", () => {
    delete connectedUsers[userId];
  });
});

const performChannelAction = async (action, targetUserId, channelId) => {
  const user = await Profile.findByPk(targetUserId);
  if (!user) return;

  switch (action) {
    case "/mute":
      user.update({ isMuted: true });
      io.to(channelId).emit("userMuted", { userId: targetUserId });
      break;
    case "/unmute":
      user.update({ isMuted: false });
      io.to(channelId).emit("userUnmuted", { userId: targetUserId });
      break;
    case "/ban":
      user.update({ isBanned: true });
      io.to(channelId).emit("userBanned", { userId: targetUserId });
      break;
    case "/unban":
      user.update({ isBanned: false });
      io.to(channelId).emit("userUnbanned", { userId: targetUserId });
      break;
    case action.startsWith("/set title"):
      const title = action.split('"')[1];
      await Channel.update({ title }, { where: { id: channelId } });
      io.to(channelId).emit("channelTitleUpdated", { title });
      break;
    case action.startsWith("/set description"):
      const description = action.split('"')[1];
      await Channel.update({ description }, { where: { id: channelId } });
      io.to(channelId).emit("channelDescriptionUpdated", { description });
      break;
  }
};

module.exports = io;
