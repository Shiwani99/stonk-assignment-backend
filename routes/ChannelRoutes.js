const express = require("express");
const router = express.Router();
const {
  createChannel,
  startStream,
} = require("../controllers/ChannelController");
const { authenticateToken } = require("../middleware/auth");

// This route creates channel and takes title, description as request body
router.post("/createChannel", authenticateToken, createChannel);

// This route does not take any request body as the authentication details are present in JWT token for the user
router.post("/startStream", authenticateToken, startStream);

module.exports = router;
