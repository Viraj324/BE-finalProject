const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const TeacherSchema = mongoose.Schema({
  firstName: {
    type: String,
    maxlength: [10, "Max length can be 10 characters"],
    trim: true,
  },
  lastName: {
    type: String,
    maxlength: [10, "Max length can be 10 characters"],
    trim: true,
  },
  emailID: {
    type: String,
    validate: [validator.isEmail, "Please Enter a valid Email"],
    required: true,
    unique: true,
    trim: true,
  },
  clg: {
    type: mongoose.Schema.ObjectId,
    ref: "Clg",
    required: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

TeacherSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password") || user.isNew) {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
  }
  return next();
});

TeacherSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

TeacherSchema.methods.generateJWT = function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET);
  return token;
};

module.exports = mongoose.model("Teacher", TeacherSchema);
