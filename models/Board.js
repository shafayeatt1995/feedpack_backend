const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BoardSchema = new Schema(
  {
    userID: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    userFeedback: { type: Boolean, default: true },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Board", BoardSchema);
