const Clg = require("../models/clg");

const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

const newRegistration = catchAsyncErrors(async (req, res) => {
  const data = await Clg.find({}).select("name classrooms");

  if (!data) {
    return res
      .status(400)
      .json({ success: false, message: "No colleges found" });
  }

  res.status(201).json({ success: true, message: "clgs found", data: data });
});

const createNewClg = catchAsyncErrors(async (req, res) => {
  const data = req.body;

  const newClg = new Clg(data);
  await newClg.save();

  if (!newClg) {
    return res
      .status(400)
      .json({ success: false, message: "No college createc" });
  }

  res
    .status(201)
    .json({ success: true, message: "clgs created", data: newClg });
});

const getClassroomsOfClg = catchAsyncErrors(async (req, res) => {
  console.log(req.query.clg_id);
  const data = await Clg.findOne({ _id: req.query.clg_id }).select(
    "name classrooms"
  );

  if (!data) {
    return res
      .status(400)
      .json({ success: false, message: "No classrooms found" });
  }

  res
    .status(201)
    .json({ success: true, message: "classrooms found", data: data });
});

module.exports = {
  newRegistration,
  createNewClg,
  getClassroomsOfClg,
};
