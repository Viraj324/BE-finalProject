const Teacher = require("../../models/teacher");
const Room = require("../../models/room");
const Quiz = require("../../models/quiz");
const Question = require("../../models/question");

const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");

const summaryOfRoom = catchAsyncErrors(async (req, res) => {
  const { id: roomID } = req.params;
  const room = await Room.find({ _id: roomID })
    .populate({
      path: "creator",
      select: "_id emailID firstName",
    })
    .select("creator topics quiz title");
  if (!room) {
    return res
      .status(401)
      .send({ success: false, message: "failed to find room" });
  }
  return res.status(200).send({
    success: true,
    message: "found the topics covered in session",
    data: room,
  });
});

const addTopicToRoom = catchAsyncErrors(async (req, res) => {
  const teacherID = req.userId;
  const { id: roomID } = req.params;
  const summary = req.body.summary;

  const quiz = req.body.quiz;
  if (summary == null || quiz == null) {
    return res.status(401).send({ success: false, message: "Invalid request" });
  }

  const updatedRoom = await Room.findOneAndUpdate(
    { _id: roomID, creator: teacherID },
    {
      $push: { topics: summary },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedRoom) {
    return res
      .status(401)
      .send({ success: false, message: "failed to update" });
  }

  const quizID = updatedRoom.quiz;
  const data = {
    text: req.body.quiz.question,
    options: req.body.quiz.options,
    correctAnswer: req.body.quiz.correct_answer,
    explanation: req.body.quiz.explanation,
  };

  const newQuestion = await Question.create(data);

  if (!newQuestion) {
    return res
      .status(401)
      .send({ success: false, message: "Failed to create quiz" });
  } else {
    await Quiz.findOneAndUpdate(
      { _id: quizID },
      { $push: { questions: newQuestion._id } },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  res.status(201).json({
    success: true,
    message: "Question added sucessfully",
  });
});

module.exports = {
  addTopicToRoom,
  summaryOfRoom,
};
