const mongoose = require("mongoose");
const { Feedback, Comment } = require("../models");
const { parseError, objectID, paginate } = require("../utils");
const controller = {
  async createFeedback(req, res) {
    try {
      const { boardID, title, description } = req.body;
      await Feedback.create({
        userID: objectID(req.user._id),
        boardID,
        title,
        description,
      });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
  async getFeedback(req, res) {
    try {
      const { _id, page, limit } = req.query;
      const items = await Feedback.aggregate([
        { $match: { boardID: objectID(_id) } },
        { $sort: { _id: -1 } },
        ...paginate(page, limit),
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "feedbackID",
            as: "commentCount",
          },
        },
        {
          $addFields: {
            voteCount: { $size: "$vote" },
            voted: { $in: [objectID(req.user._id), "$vote"] },
            commentCount: { $size: "$commentCount" },
          },
        },
        { $project: { vote: 0 } },
      ]);
      return res.json({ items });
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
  async getPublicFeedback(req, res) {
    try {
      const { _id, page, limit } = req.query;
      const items = await Feedback.aggregate([
        { $match: { boardID: objectID(_id) } },
        { $sort: { _id: -1 } },
        ...paginate(page, limit),
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "feedbackID",
            as: "commentCount",
          },
        },
        {
          $addFields: {
            voteCount: { $size: "$vote" },
            voted: { $in: [objectID(req?.user?._id), "$vote"] },
            commentCount: { $size: "$commentCount" },
          },
        },
        { $project: { vote: 0 } },
      ]);
      return res.json({ items });
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
  async updateFeedbackStatus(req, res) {
    try {
      const { _id, status } = req.body;
      await Feedback.findByIdAndUpdate(_id, { status });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
  async toggleFeedbackVote(req, res) {
    try {
      const { _id } = req.body;
      const { _id: userID } = req.user;

      const feedback = await Feedback.findById(_id).select("vote");
      const vote = feedback.vote;
      const index = vote.indexOf(userID);
      index === -1 ? vote.push(userID) : vote.splice(index, 1);
      await Feedback.findByIdAndUpdate(_id, { vote });

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
  async deleteFeedback(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { _id } = req.query;
      const { _id: userID } = req.user;

      await Comment.deleteMany({ feedbackID: objectID(_id) }, { session });
      await Feedback.findOneAndDelete(
        { _id: objectID(_id), userID: objectID(userID) },
        { session }
      );

      await session.commitTransaction();
      await session.endSession();
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      await session.abortTransaction();
      await session.endSession();
      return res.status(500).json(parseError(error));
    }
  },
};

module.exports = controller;
