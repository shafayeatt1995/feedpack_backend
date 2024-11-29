const mongoose = require("mongoose");
const { Board, Feedback, Comment } = require("../models");
const { parseError, paginate, objectID, stringSlug } = require("../utils");

const controller = {
  async getBoard(req, res) {
    try {
      const { slug } = req.query;
      const board = await Board.findOne({
        slug,
        userID: objectID(req.user._id),
      });
      return res.json({ board });
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
  async getPublicBoard(req, res) {
    try {
      const { slug } = req.query;
      const board = await Board.findOne({ slug });
      return res.json({ board });
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
  async createBoard(req, res) {
    try {
      const { name, userFeedback } = req.body;
      await Board.create({
        userID: req.user._id,
        name,
        slug: stringSlug(name),
        userFeedback,
      });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
  async getBoards(req, res) {
    try {
      const { page, limit } = req.query;
      const boards = await Board.aggregate([
        { $match: { userID: objectID(req.user._id) } },
        ...paginate(page, limit),
      ]);
      return res.json({ boards });
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
  async deleteBoard(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { slug } = req.query;
      const board = await Board.findOneAndDelete(
        { slug, userID: objectID(req.user._id) },
        { session }
      );
      const findFeedback = await Feedback.find(
        { boardID: objectID(board._id) },
        { _id: 1 }
      );
      const feedbackList = findFeedback.map((f) => f._id);
      await Comment.deleteMany(
        { feedbackID: { $in: feedbackList } },
        { session }
      );
      await Feedback.deleteMany({ boardID: objectID(board._id) }, { session });

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
