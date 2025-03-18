const express = require("express");
const {
  personalizationForStudent,
  guidanceForTeacher,
  getExplanation
} = require("../controllers/personalization/personalization");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

router.route("/student").get(verifyToken, personalizationForStudent);

router.route("/teacher").get(verifyToken, guidanceForTeacher);

router.route("/summarize").post(verifyToken, getExplanation);

module.exports = router;
