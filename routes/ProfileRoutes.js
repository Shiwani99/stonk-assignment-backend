const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const app = express();

const router = express.Router();

const profileController = require("../controllers/ProfileController");

router.use(bodyParser.json());

router.get("/profile/fetch", profileController.fetchProfile);
router.put("/profile/update", profileController.updateProfile);
router.post(
  "/profile/request-verification-code",
  profileController.requestVerificationCode
);
router.post("/profile/add-twofa", profileController.add2FA);

router.post("/profile/follow", profileController.followProfile);
router.post("/profile/unfollow", profileController.unfollowProfile);

module.exports = router;
