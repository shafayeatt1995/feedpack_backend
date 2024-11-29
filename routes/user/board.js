const express = require("express");
const {
  createBoard,
  getBoards,
  deleteBoard,
  getBoard,
} = require("../../controllers/BoardController");
const { validation } = require("../../validation");
const { boardValidation } = require("../../validation/board");
const router = express.Router();

router.get("/all", getBoards);
router.get("/", getBoard);
router.post("/", boardValidation, validation, createBoard);
router.delete("/", deleteBoard);

module.exports = router;
