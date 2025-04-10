const express = require("express");
const { createQuiz } = require("../controllers/Quiz/quiz");
const {
  joinRoom,
  getSpecificRoom,
  addAttentionOfStudent,
  closeRoom,
} = require("../controllers/Room/room");
const { addTopicToRoom, summaryOfRoom } = require("../controllers/Room/topics");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

router
  .route("/:id")
  .patch(verifyToken, joinRoom)
  .get(verifyToken, getSpecificRoom);

router
  .route("/:id/topics")
  .get(summaryOfRoom)
  .patch(verifyToken, addTopicToRoom);

router.route("/:id/attention").patch(verifyToken, addAttentionOfStudent);

router.route("/:id/quiz").post(verifyToken, createQuiz);
router.route("/:id/close-room").post(verifyToken, closeRoom);

module.exports = router;
