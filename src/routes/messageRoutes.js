const express = require("express");
const { sendMessage } = require("../controllers/messageController");
const authMiddleware = require("../middlewares/authMiddleware");
const { messageValidator } = require("../validators/messageValidator");

const router = express.Router();

router.post("/", authMiddleware, messageValidator, sendMessage);

module.exports = router;
