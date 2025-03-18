const express = require("express");
const verifyToken = require("../middlewares/auth");
const {
  newRegistration,
  createNewClg,
  getClassroomsOfClg,
} = require("../controllers/common");

const router = express.Router();

router.route("/new-registration").get(newRegistration);

router.route("/create-new-clg").post(createNewClg);

router.route("/get-classrooms-clg").get(getClassroomsOfClg);

module.exports = router;
