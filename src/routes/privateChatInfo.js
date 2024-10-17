const express = require('express');
const { searchPrivateChat } = require('../controllers/privateChatController');
const router = express.Router();

router.get('/private-chat/search', searchPrivateChat);

module.exports = router;