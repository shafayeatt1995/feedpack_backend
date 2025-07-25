const express = require("express");
const { getPublicBoard } = require("../controllers/BoardController");
const {
  fetchPublicFeedbackComments,
} = require("../controllers/CommentController");
const {
  getPublicFeedback,
  toggleFeedbackVote,
} = require("../controllers/FeedbackController");
const router = express.Router();

router.get("/board", getPublicBoard);
router.get("/feedback", getPublicFeedback);
router.get("/feedback-comments", fetchPublicFeedbackComments);
router.post("/feedback/vote", toggleFeedbackVote);

module.exports = router;
