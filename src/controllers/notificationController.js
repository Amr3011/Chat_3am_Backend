const Notification = require('../models/notificationModel');
const expressAsyncHandler = require('express-async-handler');

exports.createNotification = expressAsyncHandler(async (req, res) => {
    const { receiverId, message, chatId } = req.body;

    const senderId = req.user._id;

    try {
        const notification = new Notification({
            sender: senderId,
            receiver: receiverId,
            message: message,
            chatRef : chatId,
            read: false,
        });

        const savedNotification = await notification.save();

        res.status(201).json({
            success: true,
            data: savedNotification,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create notification.',
            error: error.message,
        });
    }
});

// Get all notifications for a user
exports.getUserNotifications = expressAsyncHandler(async (req, res) => {
    const userId = req.user._id;

    try {
        const notifications = await Notification.find({ receiver: userId })
            .sort('-createdAt')
            .populate('sender', 'username avatar _id');

        res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications.',
            error: error.message,
        });
    }
});
