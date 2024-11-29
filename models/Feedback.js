const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema(
  {
    userID: { type: Schema.Types.ObjectId, ref: "User" },
    boardID: { type: Schema.Types.ObjectId, ref: "Board" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    vote: { type: [Schema.Types.ObjectId], default: [], select: false },
    status: {
      type: String,
      default: "none",
      enum: [
        "none",
        "researching",
        "planning",
        "in_progress",
        "beta",
        "on_hold",
        "fixed",
        "complete",
        "cancel",
      ],
    },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
