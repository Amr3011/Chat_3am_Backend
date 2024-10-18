const express = require("express");
const {
  sendMessage,
  getMessages
} = require("../controllers/messageController");
const authMiddleware = require("../middlewares/authMiddleware");
const { messageValidator } = require("../validators/messageValidator");

const router = express.Router();

router.post("/", authMiddleware, messageValidator, sendMessage);
router.get("/:chatId", authMiddleware, getMessages);

module.exports = router;
