const { check } = require("express-validator");

const validate = {
  feedbackValidation: [
    check("title").isLength({ min: 1 }).withMessage("Title required"),
    check("description")
      .isLength({ min: 1, max: 500 })
      .withMessage("Description must be between 1 and 500 characters"),
  ],
};

module.exports = validate;
