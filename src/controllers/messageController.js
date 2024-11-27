const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const Notification = require("../models/notificationModel"); // Import Notification model
const expressAsyncHandler = require("express-async-handler");

exports.sendMessage = async (req, res) => {
  try {
    const { content, contentType, chatId } = req.body;

    // Create a new message
    let message = new Message({
      sender: req.user, // Assumes `req.user` contains the logged-in user's ID
      content,
      contentType: contentType || "text", // Default content type to 'text' if not provided
      chatRef: chatId,
      isSeen: false,
      isDelivered: false,
    });

    // Save the message to the database
    message = await message.save();

    // Update the Chat with the latest message
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

    // Find the chat to get the users involved
    const chat = await Chat.findById(chatId).populate("usersRef", "_id");

    // Create a notification for all users in the chat except the sender
    const receiverIds = chat.usersRef
      .filter((user) => user._id.toString() !== req.user._id.toString())
      .map((user) => user._id);

    if (receiverIds.length > 0) {
      await Notification.create(
        receiverIds.map((receiverId) => ({
          sender: req.user._id,
          receiver: receiverId,
          message: message._id,
          chatRef: chatId,
        }))
      );
    }

    // Populate sender, chat, and users details for the response
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


// Fetch messages for a chat or group chat or search messages
exports.getMessages = expressAsyncHandler(async (req, res) => {
  const page = parseInt(req?.query?.page) || 1;
  const limit = parseInt(req?.query?.limit) || 7;
  const skip = (page - 1) * limit;
  const { chatId } = req.params;
  const filterObject = req.query.search
    ? {
        chatRef: chatId,
        $or: [
          { content: { $regex: req.query.search, $options: "i" } },
          { contentType: { $regex: req.query.search, $options: "i" } }
        ]
      }
    : { chatRef: chatId };
  const documents = await Message.countDocuments(filterObject);

  const messages = await Message.find(filterObject)
    .sort("createdAt")
    .skip(skip)
    .limit(limit)
    .select(
      "_id sender content contentType isSeen isDelivered updatedAt createdAt chatRef"
    )
    .populate({
      path: "sender",
      select: "username avatar _id",
      model: "User"
    })
    .populate({
      path: "chatRef",
      select: "usersRef",
      model: "Chat",
      populate: {
        path: "usersRef",
        select: "username avatar _id",
        model: "User"
      }
    });

  res.status(200).json({
    data: messages,
    length: messages.length,
    documents,
    totalPages: Math.ceil(documents / limit)
  });
});
