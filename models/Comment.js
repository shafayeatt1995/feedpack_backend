const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    userID: { type: Schema.Types.ObjectId, ref: "User" },
    feedbackID: { type: Schema.Types.ObjectId, ref: "Feedback" },
    message: { type: String, required: true },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Comment", CommentSchema);
