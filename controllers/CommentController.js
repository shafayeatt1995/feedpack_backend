const { Comment } = require("../models");
const { parseError, objectID, paginate } = require("../utils");
const controller = {
  async createComment(req, res) {
    try {
      const { _id, message } = req.body;
      const comment = await Comment.create({
        feedbackID: _id,
        userID: req.user._id,
        message,
      });
      const [item] = await Comment.aggregate([
        { $match: { _id: objectID(comment._id) } },
        {
          $lookup: {
            from: "users",
            localField: "userID",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $addFields: {
            userName: "$user.name",
            userAvatar: "$user.avatar",
          },
        },
        { $project: { user: 0 } },
      ]);

      return res.json({ item });
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
  async fetchFeedbackComments(req, res) {
    try {
      const { _id, page, limit } = req.query;
      const items = await Comment.aggregate([
        { $match: { feedbackID: objectID(_id) } },
        { $sort: { _id: -1 } },
        ...paginate(page, limit),
        {
          $lookup: {
            from: "users",
            localField: "userID",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $addFields: {
            userName: "$user.name",
            userAvatar: "$user.avatar",
          },
        },
        { $project: { user: 0 } },
      ]);

      return res.json({ items });
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
  async fetchPublicFeedbackComments(req, res) {
    try {
      const { _id, page, limit } = req.query;
      const items = await Comment.aggregate([
        { $match: { feedbackID: objectID(_id) } },
        { $sort: { _id: -1 } },
        ...paginate(page, limit),
        {
          $lookup: {
            from: "users",
            localField: "userID",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $addFields: {
            userName: "$user.name",
            userAvatar: "$user.avatar",
          },
        },
        { $project: { user: 0 } },
      ]);

      return res.json({ items });
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
  async deleteComment(req, res) {
    try {
      const { _id } = req.query;
      await Comment.findByIdAndDelete(_id);

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
};

module.exports = controller;
