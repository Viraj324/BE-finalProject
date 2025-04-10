const Room = require("../../models/room");

const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");

const joinRoom = catchAsyncErrors(async (req, res) => {
  const { id: roomID } = req.params;
  const studentID = req.userId;

  const updatedRoom = await Room.findOneAndUpdate(
    { _id: roomID },
    {
      $addToSet: { members: studentID },
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
  return res
    .status(201)
    .send({ success: true, message: "added student to the room" });
});

const getSpecificRoom = catchAsyncErrors(async (req, res) => {
  const { id: roomID } = req.params;

  const room = await Room.findOne({ _id: roomID }).select("classroom")
    .populate({
      path: "members",
      model: "Student",
      select: "emailID firstName _id",
    })
    .populate({
      path: "creator",
      model: "Teacher",
      select: "emailID firstName _id",
    });

  if (!room) {
    return res
      .status(401)
      .send({ success: false, message: "failed to find room" });
  }
  return res.status(201).send({
    success: true,
    message: "found room. to view json data use json.parse()",
    data: JSON.stringify(room),
  });
});

const addAttentionOfStudent = catchAsyncErrors(async (req, res) => {
  const { id: roomID } = req.params;
  const studentID = req.userId;

  const body = req.body;

  const updatedRoom = await Room.findOneAndUpdate(
    { _id: roomID },
    {
      $addToSet: {
        analysis: { student: studentID, attention: body.attention },
      },
      $inc: {
        total_attention: body.attention,
      },
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
  return res
    .status(201)
    .send({ success: true, message: "added students attention to the room" });
});

const closeRoom = catchAsyncErrors(async (req, res) => {

  const { id: roomID } = req.params;

  try {
    
    const roomResponse = await Room.findOneAndUpdate(
      { _id: roomID },
      { isActive: false },
      { new: true, runValidators: true }
    )

    return res.status(200).json({ message: "Room closed successfully", roomResponse });
    
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
  
});


module.exports = {
  joinRoom,
  getSpecificRoom,
  addAttentionOfStudent,
  closeRoom
};
