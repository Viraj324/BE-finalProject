const express = require("express");
const {
  createStudentAccount,
  loginForStudent,
  getRoomsJoinedByStud,
  getStudent,
} = require("../controllers/Student/student");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

router.route("/register").post(createStudentAccount);

router.route("/login").post(loginForStudent);

router.route("/rooms").post(verifyToken, getRoomsJoinedByStud);

router.route("/:studentID").get(getStudent);

module.exports = router;
