const Student = require("../../models/student");
const Room = require("../../models/room");

const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");

const createStudentAccount = catchAsyncErrors(async (req, res) => {
  const body = req.body;

  const student = new Student(body);
  await student.save();
  const token = student.generateJWT();

  if (!student) {
    res
      .status(400)
      .json({ success: false, message: "student could not be created" });
  }
  res.status(201).json({
    success: true,
    message: "student created",
    data: { student: student, tokem: token },
  });
});

const loginForStudent = catchAsyncErrors(async (req, res) => {
  const { emailID, password } = req.body;
  const student = await Student.findOne({ emailID });
  if (!student) {
    return res.status(401).json({ success: false, message: "Login failed" });
  }
  const isMatch = await student.comparePassword(password);
  if (!isMatch) {
    return res.status(401).send({ success: false, message: "Login failed" });
  }
  const token = student.generateJWT();
  res.status(201).json({
    success: true,
    message: "Login successfully",
    data: { student: student, tokem: token },
  });
});

const getRoomsJoinedByStud = catchAsyncErrors(async (req, res) => {
  const studentID = req.userId;
  if (!req.body || !req.body.classroom) {
    return res
      .status(401)
      .send({ success: false, message: "Missing parameters classroom" });
  }

  const classroom = req.body.classroom;
  const clg = req.body.clg;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 8;
  var skip = (page - 1) * limit;

  const rooms = await Room.find({ classroom: classroom, clg: clg })
    .sort("-createdAt")
    .skip(skip)
    .limit(limit)
    .select("title creator createdAt")
    .populate("creator", "firstName");

  if (!rooms) {
    return res
      .status(401)
      .json({ success: false, message: "Failed to find any rooms" });
  }
  res.status(201).json({
    success: true,
    message: "found the rooms",
    data: JSON.stringify(rooms),
    count: rooms.length,
  });
});

const getStudent = catchAsyncErrors(async (req, res) => {
  const { studentID: studentID } = req.params;

  const student = await Student.findOne({ _id: studentID });
  if (!student) {
    return res
      .status(401)
      .json({ success: false, message: "couldn't found the details" });
  }

  const token = student.generateJWT();

  res.status(201).json({
    success: true,
    message: "student details",
    data: { student: student, token: token },
  });
});

module.exports = {
  createStudentAccount,
  loginForStudent,
  getRoomsJoinedByStud,
  getStudent,
};
