const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const app = express();

const router = express.Router();

const profileController = require("../controllers/ProfileController");

router.use(bodyParser.json());

router.get("/profile/fetch", profileController.fetchProfile);
router.put("/profile/update", profileController.updateProfile);
//router.post("/profile/2fa", checkAuthentication, add2FA);

//router.post("/profile/follow", checkAuthentication, followProfile);
//router.post("/profile/unfollow", checkAuthentication, unfollowProfile);

module.exports = router;
