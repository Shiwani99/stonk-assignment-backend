const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const app = express();

const router = express.Router();

const signupAndLoginController = require("../controllers/SignupAndLoginController.js");

router.use(bodyParser.json());

router.post("/auth/signup", signupAndLoginController.signup);

router.post("/auth/login", signupAndLoginController.login);

router.post("/auth/logout", signupAndLoginController.logout);

router.get("/auth/google", signupAndLoginController.googleSignUp);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/error" }),
  (req, res) => {
    res.redirect("/");
  }
);
module.exports = router;
