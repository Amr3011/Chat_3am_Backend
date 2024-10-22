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
    chatRef
  });
  notification = await notification.save();
  notification = await notification
    .populate("sender", "username avatar _id")
    .populate("receiver", "username avatar _id")
    .populate("message", "content contentType");

  res.status(201).json({
    success: true,
    notification
  });
});
