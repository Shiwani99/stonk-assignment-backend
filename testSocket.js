const io = require("socket.io-client");
const jwt = require("jsonwebtoken");

const socket = io("http://localhost:8080", {
  auth: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFjNTZjMzFiLWZiY2UtNDA3MC1hNTcyLTk2YjliMmM0NjAxYyIsImVtYWlsIjoieXl6ekBnbWFpbC5jbyIsImlhdCI6MTcxODYyMDcyNSwiZXhwIjoxNzE4NjI0MzI1fQ.PoMJu1L6H_s9nfSuz3nItAfydmpZUodGSvAR2QQJTCE",
  },
});

socket.on("connect", () => {
  console.log("Connected to WebSocket server");

  const channelId = "7cf94e2b-74f7-43d7-803d-e60ab304b005";
  socket.emit("joinChannel", { channelId });

  socket.on("channelMessages", (messages) => {
    console.log("Channel messages:", messages);
  });

  const message = "Hello, world!";
  socket.emit("sendMessage", { channelId, message });

  socket.on("newMessage", (newMessage) => {
    console.log("New message:", newMessage);
  });

  const action = '/set description "this is a channel description"';
  const targetUsername = "rv";
  socket.emit("performAction", { action, targetUsername, channelId });

  socket.on("channelDescriptionUpdated", (data) => {
    console.log("description", data);
  });
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});

socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server");
});
