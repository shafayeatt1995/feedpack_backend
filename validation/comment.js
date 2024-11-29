const { check } = require("express-validator");

const validate = {
  commentValidation: [
    check("message")
      .isLength({ min: 1, max: 300 })
      .withMessage("Comment must be between 1 and 300 characters"),
  ],
};

module.exports = validate;
