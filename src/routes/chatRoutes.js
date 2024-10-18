const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

const {
  createPrivateChat,
  fetchPrivateChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
  fetchGroupChats
} = require("../controllers/chatController");
const { createGroupChatValidator } = require("../validators/chatValidator");

router
  .route("/")
  .post(authMiddleware, createPrivateChat)
  .get(authMiddleware, fetchPrivateChats);

router
  .route("/group")
  .post(authMiddleware, createGroupChatValidator, createGroupChat)
  .get(authMiddleware, fetchGroupChats)
  .put(authMiddleware, renameGroup);

router.route("/group-add").put(authMiddleware, addToGroup);
router.route("/group-remove").put(authMiddleware, removeFromGroup);

module.exports = router;
