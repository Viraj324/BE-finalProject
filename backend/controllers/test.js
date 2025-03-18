// const Task = require("../models/task");

const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

const getTest = catchAsyncErrors(async (req, res) => {
    res.status(200).json({ data: "backend running" });
})

module.exports = {
  getTest,
};
