const io = require("socket.io-client");
const jwt = require("jsonwebtoken");

const socket = io("http://localhost:8080", {
  auth: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUyY2JkOTAwLWJiMTItNGQ2Ni1hZjM4LTRiYTRjNDU4ODM4YiIsImVtYWlsIjoidHl1QGdtYWlsLmNvbSIsImlhdCI6MTcxODU3NTI0MywiZXhwIjoxNzE4NTc4ODQzfQ.HfYkbxga32lTLotdRqhYdLQHRk0YPt1IDMz2_tq_5Cw",
  },
});

socket.on("connect", () => {
  console.log("Connected to WebSocket server");

  const channelId = "d01d98b0-7a13-45f5-afb2-3c3ae3981c97";
  socket.emit("joinChannel", { channelId });

  socket.on("channelMessages", (messages) => {
    console.log("Channel messages:", messages);
  });

  const message = "Hello, world!";
  socket.emit("sendMessage", { channelId, message });

  socket.on("newMessage", (newMessage) => {
    console.log("New message:", newMessage);
  });

  const action = "/mute";
  const targetUserId = "45d1c7c5-2b04-41ba-9f4a-0b6c4a7b8c75";
  socket.emit("performAction", { action, targetUserId, channelId });

  socket.on("userMuted", (data) => {
    console.log("User muted:", data);
  });
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});

socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server");
});
