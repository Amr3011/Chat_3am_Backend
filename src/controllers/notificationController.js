const Notification = require("../models/notificationModel");
const expressAsyncHandler = require("express-async-handler");

// Get all notifications for a user
exports.getUserNotifications = expressAsyncHandler(async (req, res) => {
  const notifications = await Notification.find({ receiver: req.user._id })
    .sort("createdAt")
    .populate("sender", "username avatar _id")
    .populate("message", "content contentType");

  res.status(200).json({
    success: true,
    notifications
  });
});

exports.createNotification = expressAsyncHandler(async (req, res) => {
  const { sender, receiver, message, chatRef } = req.body;

  let notification = new Notification({
    sender,
    receiver,
    message,
    chatRef,
  });

  // Save the notification
  notification = await notification.save();

  // Populate fields
  await notification.populate("sender", "username avatar _id");
  await notification.populate("receiver", "username avatar _id");
  await notification.populate("message", "content contentType");

  res.status(201).json({
    success: true,
    notification,
  });
});

// Delete all notifications for a user
exports.deleteAllUserNotifications = expressAsyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({ receiver: req.user._id });

  res.status(200).json({
    success: true,
    message: "All notifications deleted successfully.",
    deletedCount: result.deletedCount,
  });
});
