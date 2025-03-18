const mongoose = require("mongoose");

const clgSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  classrooms: {
    type: [String],
    default: [],
    unique: true,
  },
  city: {
    type: String,
    required: true,
  },

  time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Clg", clgSchema);
