const { Profile, Followers, twoFA } = require("../models");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

require("dotenv").config();

const fetchProfile = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const email = decodedToken.email;

    let user = await Profile.findOne({
      where: { email: email },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ profile: user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

const updateProfile = async (req, res) => {
  const updatedEmail = req.body.email;
  const updatedUsername = req.body.username;
  const updatedfullName = req.body.fullName;
  const updatedPassword = req.body.password;

  const token = req.headers.authorization;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  const id = decodedToken.id;

  try {
    let user = await Profile.findOne({
      where: { id: id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.email = updatedEmail || user.email;
    user.fullName = updatedfullName || user.fullName;
    user.username = updatedUsername || user.username;
    if (updatedPassword) {
      user.password = updatedPassword;
    }

    await user.save();

    res
      .status(200)
      .json({ message: "Profile updated successfully", profile: user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

const sendVerificationEmail = async (email) => {
  const verificationCode = Math.floor(100000 + Math.random() * 900000);

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
    subject: "Verification Code for 2FA stonk assignment",
    text: `Your verification code is: ${verificationCode}`,
  };

  await transporter.sendMail(mailOptions);

  return verificationCode;
};

const requestVerificationCode = async (req, res) => {
  try {
    const email = req.body.email;

    const profile = await Profile.findOne({ where: { email: email } });

    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = await twoFA.findOne({ where: { userId: profile.id } });

    const verificationCode = await sendVerificationEmail(email);
    user.twoFactorAuthCode = verificationCode;
    await user.save();

    res.status(200).json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to send verification code" });
  }
};

const add2FA = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await Profile.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await twoFA.findOne({ where: { userId: user.id } });

    if (updatedUser.twoFactorAuthCode === code) {
      updatedUser.twoFactorAuthEnabled = true;
      updatedUser.twoFactorAuthCode = null;
      await updatedUser.save();

      res.status(200).json({ message: "2FA enabled successfully" });
    } else {
      res.status(400).json({ error: "Invalid verification code" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to enable 2FA" });
  }
};

const followProfile = async (req, res) => {
  const token = req.headers.authorization;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  const followerId = decodedToken.id;
  const followingId = req.params.profileId;

  try {
    const alreadyFollowing = await Followers.findOne({
      where: {
        followerId,
        followingId,
      },
    });

    if (alreadyFollowing) {
      return res
        .status(400)
        .json({ message: "You are already following this profile." });
    }

    await Followers.create({ followerId, followingId });
    res.status(200).json({ message: "Profile followed successfully." });
  } catch (err) {
    console.error("Error following profile:", err);
    res
      .status(500)
      .json({ error: "An error occurred while following the profile." });
  }
};

const unfollowProfile = async (req, res) => {
  const token = req.headers.authorization;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  const followerId = decodedToken.id;
  const followingId = req.params.profileId;

  try {
    const following = await Followers.findOne({
      where: {
        followerId,
        followingId,
      },
    });

    if (!following) {
      return res
        .status(400)
        .json({ message: "You are not following this profile." });
    }

    await Followers.destroy({
      where: {
        followerId,
        followingId,
      },
    });
    res.status(200).json({ message: "Profile unfollowed successfully." });
  } catch (err) {
    console.error("Error unfollowing profile:", err);
    res
      .status(500)
      .json({ error: "An error occurred while unfollowing the profile." });
  }
};

module.exports = {
  fetchProfile,
  updateProfile,
  sendVerificationEmail,
  requestVerificationCode,
  add2FA,
  followProfile,
  unfollowProfile,
};
