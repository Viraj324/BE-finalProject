const Room = require("../../models/room");
const Quiz = require("../../models/quiz");
const Question = require("../../models/question");
const Response = require("../../models/response");

const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");

const createQuiz = catchAsyncErrors(async (req, res) => {
  const teacherID = req.userId;
  const { id: roomID } = req.params;

  const data = {
    creator: teacherID,
    room: roomID,
    title: req.body.title,
  };

  const newQuiz = await Quiz.create(data);

  if (!newQuiz) {
    return res
      .status(401)
      .send({ success: false, message: "Failed to create quiz" });
  }

  await Room.findOneAndUpdate(
    { _id: roomID },
    { quiz: newQuiz._id },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    success: true,
    message: "Quiz created successfully",
    data: newQuiz,
  });
});

const getQuizByID = catchAsyncErrors(async (req, res) => {
  const { quiz_id: quizID } = req.params;

  const quiz = await Quiz.findOne({ _id: quizID }).populate("questions");

  if (!quiz) {
    return res
      .status(401)
      .send({ success: false, message: "Failed to find quiz" });
  } else {
    res.status(201).json({
      success: true,
      message: "Quiz",
      data: JSON.stringify(quiz),
    });
  }
});

const addQUestionToQuiz = catchAsyncErrors(async (req, res) => {
  // const teacherID = req.userId;
  const { quiz_id: quizID } = req.params;

  // creator: quizID,
  const body = req.body;
  const data = {
    text: req.body.text,
    options: req.body.options,
    correctAnswer: req.body.correctAnswer,
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

    res.status(201).json({
      success: true,
      message: "Question added sucessfully",
      data: JSON.stringify(newQuestion),
    });
  }
});

const deleteQuizByID = catchAsyncErrors(async (req, res) => {
  const { quiz_id: quizID } = req.params;

  Quiz.findOne({ _id: quizID })
    .populate("questions")
    .exec(async (err, quiz) => {
      if (err) {
        // handle error
        return res
          .status(401)
          .send({ success: false, message: "Error occured" });
      } else {
        if (quiz) {
          const questions = quiz.questions.map((question) => question._id);
          await Question.deleteMany({ _id: { $in: questions } });
          await Quiz.deleteOne({ _id: quizID });
          // handle success
          res.status(200).json({
            success: true,
            message: `Deleted quiz successfully.`,
            data: {},
          });
        } else {
          // handle not found
          return res
            .status(401)
            .send({ success: false, message: "No quiz found" });
        }
      }
    });
});

const addResponse = catchAsyncErrors(async (req, res) => {
  const { quiz_id: quizID } = req.params;
  // body student quiz answers{question answer}

  const response = await Response.create(req.body);
  if (!response) {
    return res.status(401).send({ success: false, message: "No quiz found" });
  }
  res.status(200).json({
    success: true,
    message: `Added response with ${response._id} .`,
    data: JSON.stringify(response),
  });
});

const getAllResponses = catchAsyncErrors(async (req, res) => {
  const { quiz_id: quizID } = req.params;
  const responses = await Response.find({ quiz: quizID })
    .populate("student", "firstName emailID")
    .select("score total student createdAt");

  if (!responses) {
    return res
      .status(401)
      .send({ success: false, message: "No responses found" });
  }
  res.status(200).json({
    success: true,
    message: `Found responses .`,
    data: JSON.stringify(responses),
  });
});

const getResponseByResponseID = catchAsyncErrors(async (req, res) => {
  const { quiz_id: quizID, response_id: responseID } = req.params;
  // body student quiz answers{question answer}

  const response = await Response.findOne({ _id: responseID }).populate({
    path: "answers.question",
    model: "Question",
  });
  if (!response) {
    return res
      .status(401)
      .send({ success: false, message: "No response found" });
  }
  res.status(200).json({
    success: true,
    message: `Found ${response._id} .`,
    data: JSON.stringify(response),
  });
});

const deleteResponse = catchAsyncErrors(async (req, res) => {
  const { quiz_id: quizID, response_id: responseID } = req.params;

  const response = await Response.findOneAndDelete({ _id: responseID });
  if (!response) {
    return res
      .status(401)
      .send({ success: false, message: "No response found" });
  }
  res.status(200).json({
    success: true,
    message: `Response deleted succesfully ${response._id} `,
    data: JSON.stringify(response),
  });
});

module.exports = {
  createQuiz,
  addQUestionToQuiz,
  getQuizByID,
  deleteQuizByID,
  addResponse,
  getAllResponses,
  getResponseByResponseID,
  deleteResponse,
};
