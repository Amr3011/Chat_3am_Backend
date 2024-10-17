const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const {
  accessChat,
  fetchChats,
  createChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
} = require("../controllers/chatController");
const { createChatValidator } = require("../validators/chatValidator");

//create Private Chat
router
  .route("/")
  .post(authMiddleware, accessChat)
  .get(authMiddleware, fetchChats);
router.route("/group").post(authMiddleware, createChatValidator, createChat);
router.route("/rename").put(authMiddleware, renameGroup);
router.route("/group-remove").put(authMiddleware, removeFromGroup);
router.route("/group-add").put(authMiddleware, addToGroup);

module.exports = router;
