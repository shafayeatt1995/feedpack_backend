const express = require("express");
const { validation } = require("../../validation");
const { feedbackValidation } = require("../../validation/feedback");
const {
  createFeedback,
  getFeedback,
  updateFeedbackStatus,
  toggleFeedbackVote,
  deleteFeedback,
} = require("../../controllers/FeedbackController");
const router = express.Router();

router.get("/", getFeedback);
router.post("/", feedbackValidation, validation, createFeedback);
router.post("/status", updateFeedbackStatus);
router.post("/vote", toggleFeedbackVote);
router.delete("/", deleteFeedback);

module.exports = router;
