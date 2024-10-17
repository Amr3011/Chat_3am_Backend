const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

exports.sendMessage = async (req, res) => {
  try {
    const { content, contentType, chatId } = req.body;

    // Create a new message
    let message = new Message({
      sender: req.user, // Assumes `req.user` contains the logged-in user's ID
      content,
      contentType: contentType, // Default content type to 'text' if not provided
      chatRef: chatId,
      isSeen: false,
      isDelivered: false
    });

    // Save the message to the database
    message = await message.save();
    // Update the Chat with the latest message
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

    // Populate sender, chat, and users details
    message = await Message.findOne({ _id: message._id })
      .populate({
        path: "sender",
        select: "username avatar _id",
        model: "User"
      })
      .populate("chatRef")
      .populate({
        path: "chatRef",
        select: "chatName isGroup",
        model: "Chat"
      });

    // Respond with the populated message
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    // Handle errors and respond with a 500 status
    res.status(500).json({
      success: false,
      message: "Failed to send message.",
      error: error.message
    });
  }
};
