const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const app = express();
const router = express.Router();

const { signUpValidate, loginValidate } = require("../middleware/auth.js");

const signupAndLoginController = require("../controllers/SignupAndLoginController.js");

router.use(bodyParser.json());

// sign up route takes fullName, username, email, password in the request body
router.post("/auth/signup", signUpValidate, signupAndLoginController.signup);

// login route takes email, password, FCM registration token which is usually sent from frontend
// for testing purpose, you can use any string
// add JWT token bearer to authorization header
router.post("/auth/login", loginValidate, signupAndLoginController.login);

// log out route only requires JWT token bearer in authorization header.
// This route does not have any request body besides authorization header.
router.post("/auth/logout", signupAndLoginController.logout);

// google authentication route registers if the user is not present in Profiles table else it will let the user login
// This only has email, password from google and other details like username and fullName is retrieved from google
router.get("/auth/google", signupAndLoginController.googleSignUp);

// This routes to callback path after google sign up or login. if the authentication is successful, it routes to root path '/' else to error path '/error'
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/error" }),
  (req, res) => {
    res.redirect("/");
  }
);
module.exports = router;
