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
  searchChat
} = require("../controllers/chatController");
const { createChatValidator } = require("../validators/chatValidator");

//  
router
  .route("/")
  .post(authMiddleware, accessChat)
  .get(authMiddleware, fetchChats);

// search chat
router.route("/:chatId").get(authMiddleware, searchChat);

router.route("/group").post(authMiddleware, createChatValidator, createChat);
router.route("/rename").put(authMiddleware, renameGroup);
router.route("/group-remove").put(authMiddleware, removeFromGroup);
router.route("/group-add").put(authMiddleware, addToGroup);

module.exports = router;
