const { check } = require("express-validator");
const { Board } = require("../models");
const { stringSlug } = require("../utils");

const validate = {
  boardValidation: [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Name required")
      .custom(async (value, { req }) => {
        const { isBasicUser, isFreeUser } = req.user;

        if (isFreeUser) {
          throw new Error("Please purchase a plan to create a board");
        } else if (isBasicUser) {
          const boards = await Board.find({ userID: req.user._id });
          if (boards.length >= 1) {
            throw new Error("You can't create more than 1 boards");
          }
        }
        const board = await Board.findOne({ slug: stringSlug(value) });
        if (board) {
          throw new Error("Board name already Used");
        }
        return true;
      }),
  ],
};

module.exports = validate;
