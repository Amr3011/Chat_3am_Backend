const express = require("express");
const {
  createNotification,
  getUserNotifications
} = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to get all notifications for a specific user
router
  .route("/")
  .get(authMiddleware, getUserNotifications)
  .post(authMiddleware, createNotification);

module.exports = router;
