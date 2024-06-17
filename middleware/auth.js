const jwt = require("jsonwebtoken");
const { Profile, Role } = require("../models");
const validator = require("validator");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
};

const authorize = (requiredRole) => async (req, res, next) => {
  const userId = req.user.id;
  const { channelId } = req.params;

  const role = await Role.findOne({ where: { userId, channelId } });

  if (!role || ![requiredRole, "SUPERADMIN"].includes(role.name)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
};

const isValidPassword = (password) => {
  const lengthCheck = password.length >= 8;
  const alphabetCheck = /[a-zA-Z]/.test(password);
  const numberCheck = /[0-9]/.test(password);
  const specialCharCheck = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return lengthCheck && alphabetCheck && numberCheck && specialCharCheck;
};

const signUpValidate = async (req, res, next) => {
  if (req.body.fullName.length == 0) {
    return res.status(400).json({ error: "Full name is required" });
  }

  if (req.body.username.length == 0) {
    return res.status(400).json({ error: "Username is required" });
  }

  if (req.body.email.length == 0) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (req.body.password.length == 0) {
    return res.status(400).json({ error: "Password is required" });
  }

  const usernameTaken = await Profile.findOne({
    where: { username: req.body.username },
  });
  if (usernameTaken != null) {
    return res.status(400).json({ error: "Username already taken" });
  }

  const emailTaken = await Profile.findOne({
    where: { email: req.body.email },
  });
  if (emailTaken != null) {
    return res
      .status(400)
      .json({ error: "Email already exists. Please sign in." });
  }

  if (!validator.isEmail(req.body.email)) {
    return res.status(400).json({ error: "Invalid Email" });
  }

  if (!isValidPassword(req.body.password)) {
    return res.status(400).json({
      error:
        "Invalid password: password should contain at least 8 characters and should consist of letters, numbers, special characters",
    });
  }
  next();
};

const loginValidate = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email.length == 0) {
    return res.status(400).json({ error: "Email is Required" });
  }

  if (password.length == 0) {
    return res.status(400).json({ error: "Password is Required" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid Email" });
  }

  if (password.length == 0) {
    return res.status(400).json({ error: "Password is Required" });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorize,
  signUpValidate,
  loginValidate,
};
