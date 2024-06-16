const jwt = require("jsonwebtoken");
const { Profile, Role } = require("../models");
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

module.exports = { authenticateToken, authorize };
