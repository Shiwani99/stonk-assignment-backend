const { Profile } = require("../models");
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
  const { email, fullName, username, password } = req.body;

  try {
    let user = await Profile.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.fullName = fullName || user.fullName;
    user.username = username || user.username;
    if (password) {
      user.password = password;
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
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Verification Code for 2FA stonk assignment",
    text: `Your verification code is: ${verificationCode}`,
  };

  await transporter.sendMail(mailOptions);

  return verificationCode;
};

const requestVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Profile.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const verificationCode = await sendVerificationEmail(email);
    user.twoFactorAuthCode = verificationCode;
    await user.save();

    res.status(200).json({ message: "Verification code sent successfully" });
  } catch (error) {
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

    if (user.twoFactorAuthCode === code) {
      user.twoFactorAuthEnabled = true;
      user.twoFactorAuthCode = null;
      await user.save();

      res.status(200).json({ message: "2FA enabled successfully" });
    } else {
      res.status(400).json({ error: "Invalid verification code" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to enable 2FA" });
  }
};

module.exports = {
  fetchProfile,
  updateProfile,
  sendVerificationEmail,
  requestVerificationCode,
  add2FA,
};
