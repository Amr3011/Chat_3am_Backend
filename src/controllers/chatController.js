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
  chat = await chat.populate("usersRef", "username _id");
  res.status(200).json(chat);
});

exports.fetchPrivateChats = expressAsyncHandler(async (req, res) => {
  const { searchTerm } = req.query;

  // Base search criteria for private (non-group) chats involving the current user
  let searchCriteria = {
    isGroup: false,
    usersRef: { $elemMatch: { $eq: req.user._id } }
  };

  // Fetch all private chats involving the current user
  let chats = await Chat.find(searchCriteria)
    .populate("usersRef", "username name avatar _id")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  // Filter out chats where the only user in usersRef is the requesting user
  chats = chats.filter(chat =>
    chat.usersRef.some(user => user._id.toString() !== req.user._id.toString())
  );

  // If a search term is provided, further filter chats to include only those where
  // the other user's username matches the search term
  if (searchTerm) {
    chats = chats.filter(chat => {
      // Find the user in the chat who is not the requesting user
      const otherUser = chat.usersRef.find(user => user._id.toString() !== req.user._id.toString());
      // Return true if the other user's username matches the search term
      return otherUser && otherUser.username.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }

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
  const { searchTerm } = req.query;

  let searchCriteria = {
    isGroup: true,
    usersRef: { $elemMatch: { $eq: req.user._id } }
  };

  if (searchTerm) {
    searchCriteria = {
      ...searchCriteria,
      chatName: { $regex: searchTerm, $options: "i" }
    };
  }

  const chats = await Chat.find(searchCriteria)
    .populate("usersRef", "username name avatar _id")
    .populate("groupAdmin", "username name avatar _id")
    .populate("latestMessage");

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
