const io = require("socket.io-client");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const socket = io("http://localhost:8080", {
  auth: {
    token: process.env.SOCKET_JWT_TOKEN,
  },
});

socket.on("connect", () => {
  console.log("Connected to WebSocket server");

  const channelId = process.env.SOCKET_CHANNEL_ID;
  socket.emit("joinChannel", { channelId });

  socket.on("channelMessages", (messages) => {
    console.log("Channel messages:", messages);
  });

  const message = "Hello, world!";
  socket.emit("sendMessage", { channelId, message });

  socket.on("newMessage", (newMessage) => {
    console.log("New message:", newMessage);
  });

  const action = "/suspend";
  const targetUsername = process.env.SOCKET_TARGET_USERNAME;
  socket.emit("performAction", { action, targetUsername, channelId });

  socket.on("channelSuspended", (data) => {
    console.log("data", data);
  });
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});

socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server");
});
