const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    picture: {
      type: String,
      default: ""
    },
    totalSolved: {
      type: Number,
      default: 0
    },
    easyCount: {
      type: Number,
      default: 0
    },
    mediumCount: {
      type: Number,
      default: 0
    },
    hardCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
