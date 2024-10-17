const express = require('express');
const { searchGroupChat } = require('../controllers/groupChatController');
const router = express.Router();

router.get('/group-chat/search', searchGroupChat);

module.exports = router;