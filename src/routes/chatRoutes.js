const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const {
  createPrivateChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
  searchChat,
} = require("../controllers/chatController");
const { createChatValidator } = require("../validators/chatValidator");

// router.route("/search-users").get(authMiddleware, searchUsersForPrivateChat);

router
  .route("/")
  .post(authMiddleware, createPrivateChat)
  .get(authMiddleware, fetchChats);

router.g;

router
  .route("/group")
  .post(authMiddleware, createChatValidator, createGroupChat)
  .put(authMiddleware, renameGroup);

router.route("/group-add").put(authMiddleware, addToGroup);
router.route("/group-remove").put(authMiddleware, removeFromGroup);

// search chat
router.route("/:chatId").get(authMiddleware, searchChat);

module.exports = router;
