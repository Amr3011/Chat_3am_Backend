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

  let chat = await Chat.findOne({
    isGroup: false,
    $and: [
      { usersRef: { $elemMatch: { $eq: req.user._id } } },
      { usersRef: { $elemMatch: { $eq: userId } } }
    ]
  });

  if (!chat) {
    chat = new Chat({
      chatName: "Private Chat",
      isGroup: false,
      usersRef: [req.user._id, userId]
    });
    chat = await chat.save();
  }
  res.status(200).json(chat);
});

exports.fetchPrivateChats = expressAsyncHandler(async (req, res) => {
  const chats = await Chat.find({
    isGroup: false,
    usersRef: { $elemMatch: { $eq: req.user._id } }
  })
    .populate("usersRef", "username name avatar _id")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });
  res.status(200).json(chats);
});

exports.createGroupChat = expressAsyncHandler(async (req, res) => {
  let users = new Set([...req.body.users, req.user._id]);
  users = Array.from(users);
  const { chatName } = req.body;
  if (!users || users.length < 2) {
    return res.status(400).json({ message: "Group members are required" });
  }
  chat = new Chat({
    chatName,
    isGroup: true,
    usersRef: users,
    picture: req.body.picture,
    groupAdmin: req.user._id
  });
  chat = await chat.save();
  res.status(200).json(chat);
});

exports.fetchGroupChats = expressAsyncHandler(async (req, res) => {
  const chats = await Chat.find({
    isGroup: true,
    $or: [
      { usersRef: { $elemMatch: { $eq: req.user._id } } },
      { groupAdmin: req.user._id }
    ]
  })
    .populate("usersRef", "username name avatar _id")
    .populate("groupAdmin", "username name avatar _id");
  res.status(200).json(chats);
});

exports.renameGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName
    },
    {
      new: true //to return the new name of the group
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
