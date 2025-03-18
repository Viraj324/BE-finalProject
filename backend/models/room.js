const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
  meetingID: {
    type: "string",
    default: null,
    trim: true,
  },
  clg: {
    type: mongoose.Schema.ObjectId,
    ref: "Clg",
    required: true,
  },
  classroom: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: null,
    trim: true,
  },
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: "Teacher",
    required: true,
  },
  members: {
    type: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Student",
      },
    ],
    default: [],
  },
  topics: {
    type: [String],
    default: [],
  },
  quiz: {
    type: mongoose.Schema.ObjectId,
    ref: "Quiz",
    default: null,
  },
  analysis: {
    type: [
      {
        student: { type: mongoose.Schema.ObjectId, ref: "Student" },
        attention: { type: Number, min: 0, max: 100 },
      },
    ],
    default: [],
  },
  total_attention: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Room", roomSchema);
