const Teacher = require("../../models/teacher");
const Room = require("../../models/room");
const QUiz = require("../../models/quiz");
const Clg = require("../../models/clg");

const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const auth = require("../../middlewares/auth");

const createTeacherAccount = catchAsyncErrors(async (req, res) => {
  const body = req.body;

  const teacher = new Teacher(body);
  await teacher.save();
  const token = teacher.generateJWT();

  if (!teacher) {
    res
      .status(400)
      .json({ success: false, message: "Teacher could not be created" });
  }
  res.status(201).json({
    success: true,
    message: "Teacher created",
    data: { teacher: teacher, tokem: token },
  });
});

const loginForTeacher = catchAsyncErrors(async (req, res) => {
  const { emailID, password } = req.body;
  const teacher = await Teacher.findOne({ emailID });
  if (!teacher) {
    return res.status(401).json({ success: false, message: "Login failed because no teacher found" });
  }
  const isMatch = await teacher.comparePassword(password);
  if (!isMatch) {
    return res.status(401).send({ success: false, message: "Login failed password not match" });
  }
  const token = teacher.generateJWT();
  res.status(201).json({
    success: true,
    message: "Login successfully",
    data: { teacher: teacher, tokem: token },
  });
});

const createRoom = catchAsyncErrors(async (req, res) => {
  const teacherID = req.userId;
  const data = {
    creator: teacherID,
  };
  if (req.body && req.body.title) {
    data.title = req.body.title;
    data.clg = req.body.clg;
    data.classroom = req.body.classroom;
  } else {
    return res
      .status(401)
      .send({ success: false, message: "Missing parameters" });
  }

  const newRoom = await Room.create(data);

  if (!newRoom) {
    return res
      .status(401)
      .send({ success: false, message: "Failed to create room" });
  }
  const quizData = {
    creator: teacherID,
    room: newRoom._id,
    title: req.body.title,
  };

  const newQuiz = await QUiz.create(quizData);

  if (!newQuiz) {
    return res
      .status(401)
      .send({ success: false, message: "Failed to create quiz" });
  }

  const updatedRoom = await Room.findOneAndUpdate(
    { _id: newRoom._id },
    { quiz: newQuiz._id },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    success: true,
    message: "Room created successfully with quiz instance",
    data: updatedRoom,
    redirect_url: req.body.redirect_url,
  });
});

const getTeacherRooms = catchAsyncErrors(async (req, res) => {
  const { teacher_id: teacherID } = req.params;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 8;
  var skip = (page - 1) * limit;

  const rooms = await Room.find({ creator: teacherID })
    .sort("-createdAt")
    .select("title quiz classroom createdAt")
    .populate("creator", "firstName lastName _id")
    .skip(skip)
    .limit(limit);

  if (!rooms) {
    return res.status(401).send({ success: false, message: "No data found" });
  }

  res.status(200).json({
    success: true,
    message: "Found all rooms of teacher",
    data: JSON.stringify(rooms),
  });
});

const getTeacherQuizzes = catchAsyncErrors(async (req, res) => {
  const { teacher_id: teacherID } = req.params;

  const quizzes = await QUiz.find({ creator: teacherID })
    .sort("-createdAt")
    .populate("room")
    .populate({
      path: "questions",
      model: "Question",
    });

  if (!quizzes) {
    return res.status(401).send({ success: false, message: "No data found" });
  }

  res.status(200).json({
    success: true,
    message: "Found all the quizees of teacher",
    data: JSON.stringify(quizzes),
  });
});

const addNewClassroomByTeacher = catchAsyncErrors(async (req, res) => {
  const { teacher_id: teacherID } = req.params;
  const body = req.body;

  const updateData = await Clg.findOneAndUpdate(
    { _id: body.clg_id },
    { $addToSet: { classrooms: body.classroom } }
  );

  if (!updateData) {
    return res
      .status(401)
      .send({ success: false, message: "couldn't add new classroom" });
  }

  return res.status(200).json({
    success: true,
    message: "added new Classroom successfully",
  });
});

module.exports = {
  createTeacherAccount,
  loginForTeacher,
  createRoom,
  getTeacherRooms,
  getTeacherQuizzes,
  addNewClassroomByTeacher,
};
