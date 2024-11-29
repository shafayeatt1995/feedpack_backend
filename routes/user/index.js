const express = require("express");
const router = express.Router();

router.use("/board", require("./board"));
router.use("/feedback", require("./feedback"));
router.use("/comment", require("./comment"));

module.exports = router;
