const { Profile } = require("../models");
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
    const newProfile = await Profile.create({
      fullName,
      username,
      email,
      password,
    });
    const token = generateToken(newProfile);
    res.status(201).json({ profile: newProfile, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const profile = await Profile.findOne({ where: { email } });
    if (!profile || !(await profile.validatePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

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

module.exports = {
  signup,
  login,
  googleSignUp,
  googleCallback,
};
