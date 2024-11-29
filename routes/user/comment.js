const express = require("express");
const {
  createComment,
  fetchFeedbackComments,
  deleteComment,
} = require("../../controllers/CommentController");
const { validation } = require("../../validation");
const { commentValidation } = require("../../validation/comment");
const router = express.Router();

router.get("/feedback-comments", fetchFeedbackComments);
router.post("/", commentValidation, validation, createComment);
router.delete("/", deleteComment);

module.exports = router;
