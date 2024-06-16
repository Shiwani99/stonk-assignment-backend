const { Profile, twoFA, Notification } = require("../models");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

const generateToken = (profile) => {
  return jwt.sign(
    { id: profile.id, email: profile.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRATION,
    }
  );
};

const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    const active = false;
    const newProfile = await Profile.create({
      fullName: fullName,
      username: username,
      email: email,
      password: password,
      active: active,
    });

    await twoFA.create({
      userId: newProfile.id,
      twoFactorAuthEnabled: false,
    });

    res.status(201).json({ profile: newProfile });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, registrationToken } = req.body;
    const profile = await Profile.findOne({ where: { email } });
    if (!profile || !(await profile.validatePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    profile.active = true;
    await profile.save();

    await Notification.upsert({
      userId: profile.id,
      registrationToken: registrationToken,
      receiveNotifications: true,
    });

    const token = generateToken(profile);

    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const generateUniqueUsername = () => {
  const baseUsername = "google";
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${baseUsername}${randomNumber}`;
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await Profile.findOne({
          where: { email: profile.emails[0].value },
        });

        if (!user) {
          const fullName = profile.displayName;
          const username = profile.username || generateUniqueUsername();
          const email = profile.emails[0].value;
          const password = "google";

          user = await Profile.create({
            fullName,
            username,
            email,
            password,
          });
        } else {
          console.log("user already registered");
        }

        const token = generateToken(user);
        done(null, token);
      } catch (error) {
        done(error.message);
      }
    }
  )
);

const googleSignUp = passport.authenticate("google", {
  scope: ["profile", "email"],
});

const googleCallback = (req, res) => {
  res.redirect("/");
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decodedToken.id;

    await Profile.update({ active: false }, { where: { id: userId } });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error during log out" });
  }
};

module.exports = {
  signup,
  login,
  googleSignUp,
  googleCallback,
  logout,
};
