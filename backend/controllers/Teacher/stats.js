const Teacher = require("../../models/teacher");
const Room = require("../../models/room");
const QUiz = require("../../models/quiz");

const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");

// get count of students joined the room stats
const getCountOfStudents = catchAsyncErrors(async (req, res) => {
  const teacherID = req.userId;

  const recentRooms = await Room.find({ creator: teacherID })
    .sort("-createdAt")
    .select("title members createdAt avg_attention")
    .limit(10);

  const roomsWithMembersCount = recentRooms.map((room) => {
    const membersCount = room.members.length;
    return {
      _id: room._id,
      title: room.title,
      membersCount: membersCount,
      createdAt: room.createdAt,
      avg_attention: room.avg_attention,
    };
  });

  if (!roomsWithMembersCount) {
    return res.status(401).send({ success: false, message: "No data found" });
  }

  res.status(200).json({
    success: true,
    message:
      "Status to get all the recent rooms created by teacher with count of members in it",
    data: JSON.stringify(roomsWithMembersCount),
  });
});

// get session attentivness of all studnets
const getAvgAttentionOfStudents = catchAsyncErrors(async (req, res) => {
  const teacherID = req.userId;

  const recentRooms = await Room.find({ creator: teacherID })
    .sort("-createdAt")
    .select("title analysis createdAt")
    .limit(10);

  const roomsWithAvgAttention = recentRooms.map((room) => {
    let total_att = 0;
    const attentions = room.analysis.map(
      (data) => (total_att += data.attention)
    );
    return {
      _id: room._id,
      title: room.title,
      avgAttention: total_att / room.analysis.length,
      createdAt: room.createdAt,
    };
  });

  if (!roomsWithAvgAttention) {
    return res.status(401).send({ success: false, message: "No data found" });
  }

  res.status(200).json({
    success: true,
    message:
      "Status to get all the recent rooms created by teacher with count of members in it",
    data: roomsWithAvgAttention,
  });
});

module.exports = {
  getCountOfStudents,
  getAvgAttentionOfStudents,
};
