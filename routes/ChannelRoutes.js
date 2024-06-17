const express = require("express");
const router = express.Router();
const {
  createChannel,
  startStream,
} = require("../controllers/channelController");
const { authenticateToken } = require("../middleware/auth");

router.post("/createChannel", authenticateToken, createChannel);
router.post("/startStream", authenticateToken, startStream);

module.exports = router;
