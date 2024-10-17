const express = require("express");
const { sendMessage } = require("../controllers/messageController");
const authMiddleware = require("../middlewares/authMiddleware");

 const router = express.Router();
router.post("/", authMiddleware,sendMessage);

 module.exports = router;
