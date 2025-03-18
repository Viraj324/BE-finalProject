const mongoose = require("mongoose");

const quizSchema = mongoose.Schema({
  room: {
    type: mongoose.Schema.ObjectId,
    ref: "Room",
    required: true,
    unique: true,
  },
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: "Teacher",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  questions: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Question",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Quiz", quizSchema);
