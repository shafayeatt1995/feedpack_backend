const { check } = require("express-validator");

const validate = {
  commentValidation: [
    check("message")
      .isLength({ min: 1, max: 500 })
      .withMessage("Comment must be between 1 and 500 characters"),
  ],
};

module.exports = validate;
