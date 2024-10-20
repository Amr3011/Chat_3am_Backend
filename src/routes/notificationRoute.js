const express = require('express');
const {
    createNotification,
    getUserNotifications,
} = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Route to create a notification
router.post('/', authMiddleware, createNotification);

// Route to get all notifications for a specific user
router.get('/', authMiddleware, getUserNotifications);

module.exports = router;
