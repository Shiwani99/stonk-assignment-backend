const {
  Profile,
  Notification,
  Channel,
  Followers,
  Role,
} = require("../models");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

var admin = require("firebase-admin");

var serviceAccount = require("../stonk-backend-assignment-1-firebase-adminsdk-oekkc-8ac4eb7804.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendEmail = async (email, subject, body) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GOOGLE_EMAIL,
      pass: process.env.GOOGLE_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GOOGLE_EMAIL,
    to: email,
    subject: subject,
    text: body,
  };

  await transporter.sendMail(mailOptions);
};

const sendPushNotifications = async (userId, payload) => {
  try {
    const notifications = await Notification.findAll({ where: { userId } });
    const registrationTokens = notifications.map(
      (notification) => notification.registrationToken
    );

    const response = await admin
      .messaging()
      .sendToDevice(registrationTokens, { data: payload });
    console.log("Push notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
};

const createChannel = async (req, res) => {
  const { title, description } = req.body;
  const ownerId = req.user.id;

  try {
    const channel = await Channel.create({
      title,
      description,
      ownerId,
    });

    await Role.create({
      name: "HOST",
      userId: ownerId,
      channelId: channel.id,
    });

    res.status(201).json({ message: "Channel created successfully", channel });
  } catch (error) {
    console.error("Error creating channel:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const startStream = async (req, res) => {
  const token = req.headers.authorization;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  const userId = decodedToken.id;

  try {
    const user = await Profile.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const followers = await Followers.findAll({
      where: { followingId: userId },
    });
    const followerIds = followers.map((follower) => follower.followerId);
    console.log(followerIds);

    for (const followerId of followerIds) {
      const follower = await Profile.findOne({ where: { id: followerId } });
      if (follower.active) {
        await sendPushNotifications(followerId, {
          title: "Stream Started",
          body: "A stream has started",
        });
      } else {
        await sendEmail(
          follower.email,
          "Stream Started",
          "A stream has started"
        );
      }
    }

    res.status(200).json({ message: "Stream started successfully" });
  } catch (error) {
    console.error("Error starting stream:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  sendPushNotifications,
  createChannel,
  startStream,
};
