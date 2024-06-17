const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const app = express();

const router = express.Router();

const profileController = require("../controllers/ProfileController");

router.use(bodyParser.json());

// this route fetches the user profile details of the logged in user
router.get("/profile/fetch", profileController.fetchProfile);

// this route takes any of the details that needs to updated like fullName, username, email, password in the request body
router.put("/profile/update", profileController.updateProfile);

// sends verification code for 2FA authentication to email
router.post(
  "/profile/request-verification-code",
  profileController.requestVerificationCode
);

// This route takes email, code generated from /profile/request-verification-code in request body and it enables 2FA if the code matches
router.post("/profile/add-twofa", profileController.add2FA);

// This route allow a user to follow a profile and the profile id is provided in the parameters. This does not require any request body.
router.post("/profile/follow/:profileId", profileController.followProfile);

// This route allow a user to unfollow a profile and the profile id is provided in the parameters. This does not require any request body.
router.post("/profile/unfollow/:profileId", profileController.unfollowProfile);

module.exports = router;
