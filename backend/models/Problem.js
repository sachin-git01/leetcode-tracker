const mongoose = require("mongoose");
const SuggestionModel = require("./suggestionModel");

const problemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    topic: {
      type: String,
      default: "Array",
      trim: true
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy"
    },
    status: {
      type: String,
      enum: ["Solved", "Attempted", "To-Do", "Revision"],
      default: "Solved"
    },
    note: {
      type: String,
      default: ""
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    leetcodeUrl: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// High-performance compound indexes for multi-user scale
problemSchema.index({ user: 1, createdAt: -1 });
problemSchema.index({ user: 1, topic: 1 });
problemSchema.index({ user: 1, difficulty: 1 });
problemSchema.index({ user: 1, isFavorite: 1 });

// Pre-save hook: auto-fill leetcodeUrl if missing or empty
problemSchema.pre("save", function () {
  if (!this.leetcodeUrl && this.title) {
    this.leetcodeUrl = SuggestionModel.getLeetCodeUrl(this.title);
  }
});

// Transform output to have `id` matching front-end expectations
problemSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  }
});

module.exports = mongoose.model("Problem", problemSchema);
