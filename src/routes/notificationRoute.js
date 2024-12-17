const express = require("express");
const {
  createNotification,
  getUserNotifications,
  deleteAllUserNotifications,
} = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to get all notifications for a specific user
router
  .route("/")
  .get(authMiddleware, getUserNotifications)
  .post(authMiddleware, createNotification)
  .delete(authMiddleware, deleteAllUserNotifications);


module.exports = router;
