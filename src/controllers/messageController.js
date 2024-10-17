const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

exports.sendMessage = async (req, res) => {
  try {
    const { content, contentType, chatid } = req.body;

    // Check if required fields are provided
    if (!content || !chatid) {
      return res
        .status(400)
        .json({ message: "Content and chatid are required." });
    }

    // Create a new message
    let message = new Message({
      sender: req.user, // Assumes `req.user` contains the logged-in user's ID
      content,
      contentType: contentType, // Default content type to 'text' if not provided
      chatRef: chatid,
      isSeen: false,
      isDelivered: false,
    });

    // Save the message to the database
    message = await message.save();
    // Update the Chat with the latest message
    await Chat.findByIdAndUpdate(chatid, { latestMessage: message._id });

    // Populate sender, chat, and users details
    message = await Message.findOne({ _id: message._id })
      .populate({
        path: "sender",
        select: "username avatar _id",
        model: "User",
      })
      .populate("chatRef")
      .populate({
        path: "chatRef",
        select: "chatName isGroup usersRef",
        model: "Chat",
        populate: {
          path: "usersRef",
          select: "username avatar _id",
          model: "User",
        },
      });

    // Respond with the populated message
    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    // Handle errors and respond with a 500 status
    res.status(500).json({
      success: false,
      message: "Failed to send message.",
      error: error.message,
    });
  }
};
