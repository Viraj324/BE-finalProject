const express = require("express");
const {
  getCountOfStudents,
  getAvgAttentionOfStudents,
} = require("../controllers/Teacher/stats");
const {
  createTeacherAccount,
  loginForTeacher,
  createRoom,
  getTeacherRooms,
  getTeacherQuizzes,
  addNewClassroomByTeacher,
} = require("../controllers/Teacher/teacher");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

router.route("/register").post(createTeacherAccount);

router.route("/login").post(loginForTeacher);

router.route("/room").post(verifyToken, createRoom);

router.route("/:teacher_id/rooms").get(getTeacherRooms);

router.route("/:teacher_id/quizzes").get(getTeacherQuizzes);

// router to get count of students joined the room stats
router
  .route("/:teacher_id/stats/members-count")
  .get(verifyToken, getCountOfStudents);

// router to get count of students joined the room stats
router
  .route("/:teacher_id/stats/avg-attention")
  .get(verifyToken, getAvgAttentionOfStudents);

router
  .route("/:teacher_id/add-new-classroom")
  .patch(verifyToken, addNewClassroomByTeacher);

module.exports = router;
