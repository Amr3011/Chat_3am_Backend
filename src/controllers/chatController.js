const expressAsyncHandler = require("express-async-handler");

const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const Message = require("../models/messageModel");

//creating and fetching one-one chat
exports.createPrivateChat = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User Id is required" });
  }

  let isChat = await Chat.find({
    isGroup: false,
    $and: [
      { usersRef: { $elemMatch: { $eq: req.user._id } } },
      { usersRef: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("usersRef", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "username avatar email",
  });

  if (isChat.length > 0) {
    res.json(isChat[0]);
  } else {
    // Fetch the user details for the other user
    const otherUser = await User.findById(userId).select("username");

    // Ensure the user exists
    if (!otherUser) {
      return res.status(400).json({ message: "User not found" });
    }

    let chatData = {
      chatName: otherUser.username, // Set chatName dynamically based on the other user's username
      isGroup: false,
      usersRef: [req.user._id, userId],
    };

    try {
      const createdPrivateChat = await Chat.create(chatData);

      const FullChat = await Chat.findOne({
        _id: createdPrivateChat._id,
      }).populate("usersRef", "-password");

      res.status(200).json(FullChat);
    } catch (error) {
      throw new ApiError(error.message, 400);
    }
  }
});

exports.fetchChats = expressAsyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find({
      usersRef: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("usersRef", "name username email phone") // Populate usersRef with required fields
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    // Map through the chats to set the display name dynamically
    const modifiedChats = chats.map((chat) => {
      // Find the other user in the usersRef array
      const otherUser = chat.usersRef.find(
        (user) => user._id.toString() !== req.user._id.toString()
      );

      // Return the chat object along with other user details
      return {
        ...chat.toObject(), // Convert Mongoose document to plain JavaScript object
        chatName: otherUser ? otherUser.name : chat.chatName, // Set chatName to the other user's username
        email: otherUser ? otherUser.email : null, // Include email
        phone: otherUser ? otherUser.phone : null, // Include phone
      };
    });

    res.status(200).json(modifiedChats); // Return the modified chats
  } catch (error) {
    console.error("Error fetching chats:", error.message); // Log error for debugging
    res.status(500).json({ message: error.message }); // Respond with an error message
  }
});

exports.createGroupChat = expressAsyncHandler(async (req, res) => {
  let users = new Set([...req.body.users, req.user._id.toString()]);
  users = Array.from(users);
  const existChat = await Chat.findOne({
    usersRef: users,
  });

  if (existChat) {
    throw new ApiError("Chat already exists", 400);
  }

  if (!users.includes(req.user._id.toString())) {
    users.push(req.user); // Add current user along with all the people
  }

  try {
    let chat;
    chat = {
      chatName: req.body.name,
      usersRef: users,
      isGroup: true,
      groupAdmin: req.user._id,
    };
    const groupChat = await Chat.create(chat);

    const createdGroup = await Chat.findOne({ _id: groupChat._id })
      .populate({
        path: "usersRef",
        select: "email username avatar",
        model: "User",
      })
      .populate({
        path: "groupAdmin",
        select: "email username avatar",
        model: "User",
      });

    res.status(200).json(createdGroup);
  } catch (error) {
    throw new ApiError(error.message, 400);
  }
});

exports.renameGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      new: true, //to return the new name of the group
    }
  )
    .populate("usersRef", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    throw new ApiError(error.message, 404);
  } else {
    res.json(updatedChat);
  }
});
exports.addToGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const isAdmin = await Chat.findOne({ _id: chatId, groupAdmin: req.user._id });
  if (!isAdmin) {
    throw new ApiError(error.message, 404);
  }
  const updatedGroupMembers = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { usersRef: userId } },
    { new: true }
  )
    .populate("usersRef", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedGroupMembers) {
    throw new ApiError(error.message, 404);
  } else {
    res.json(updatedGroupMembers);
  }
});
exports.removeFromGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const isAdmin = await Chat.findOne({ _id: chatId, groupAdmin: req.user._id });
  if (!isAdmin) {
    throw new ApiError(error.message, 404);
  }
  const updatedGroupMembers = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { usersRef: userId } },
    { new: true }
  )
    .populate("usersRef", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedGroupMembers) {
    throw new ApiError(error.message, 404);
  } else {
    res.json(updatedGroupMembers);
  }
});

exports.searchChat = expressAsyncHandler(async (req, res) => {
  const { searchTerm } = req.query;
  const { chatId } = req.params;
  const messages = await Message.find({
    chatRef: chatId,
  })
    .find({ content: { $regex: searchTerm, $options: "i" } })
    .populate({
      path: "sender",
      select: "username avatar",
      model: "User",
    })
    .sort({ createdAt: -1 });
  if (!messages) {
    throw new ApiError("No messages found", 404);
  }
  res.json(messages);
});

// exports.searchUsersForPrivateChat = expressAsyncHandler(async (req, res) => {
//   const loggedInUserId = req.user._id;

//   // Fetch all chats that the user is already part of
//   const existingChats = await Chat.find({
//     isGroup: false,
//     usersRef: { $elemMatch: { $eq: loggedInUserId } },
//   });

//   // Extract user IDs from existing chats
//   const existingUserIds = existingChats.reduce((ids, chat) => {
//     chat.usersRef.forEach((user) => {
//       if (user.toString() !== loggedInUserId.toString()) {
//         ids.push(user.toString());
//       }
//     });
//     return ids;
//   }, []);

//   // Find users not in the existing chats
//   const usersNotInChat = await User.find({
//     _id: { $nin: [...existingUserIds, loggedInUserId] },
//   }).select("username email phone avatar");

//   res.json(usersNotInChat);
// });
