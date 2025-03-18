const mongoose = require("mongoose");

const responseSchema = mongoose.Schema({
  worker: {
    type: mongoose.Schema.ObjectId,
    ref: "workers",
    unique: true,
  },
  quotation_amnt: {
    type: Number,
  },
  selected: {
    type: String, //should be enum selected rejected noActiontaken
    enum: ["Accepted", "Rejected", "No response"],
    default: "No response",
  },
  additional_msg: {
    type: String,
    required: false,
    default: null,
  },
  time: {
    type: Date,
    default: Date.now,
  },
});

const PostSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title required"],
    maxlength: [20, "Max length can be 20 characters"],
    trim: true,
  },
  place: { type: String, required: [true, "Place required"] },
  location: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: [true, "Location coordinates are required"],
    },
  },
  description: {
    type: String,
    required: [true, "Descirption required"],
    maxlength: [50, "Max length can be 50 characters"],
    trim: true,
  },
  minBudget: {
    type: Number,
    required: true,
  },
  maxBudget: {
    type: Number,
    required: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: "Client",
    required: true,
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: "categories",
    requierd: true,
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
  responses: {
    type: [responseSchema],
    default: [],
  },
  winner: {
    worker: {
      type: mongoose.Schema.ObjectId,
      ref: "workers",
      default: null,
    },
    quotation_amnt: {
      type: Number,
      default: null,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Post", PostSchema);
