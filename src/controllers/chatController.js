const expressAsyncHandler = require("express-async-handler");

const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");

//creating and fetching one-one chat
const accessChat = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    console.log("userId not sent with request");
    return res.sendStatus(400);
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
    let chatData = {
      chatName: "sender",
      isGroup: false,
      usersRef: [res.user._id, userId],
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
const fetchChats = expressAsyncHandler(async (req, res) => {
  try {
    Chat.find({ usersRef: { $elemMatch: { $eq: req.user._id } } })
      .populate("usersRef", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "username avatar email",
        });
        res.status(200).json(results);
      });

    // );
  } catch (error) {
    throw new ApiError(error.message, 400);
  }
});
const createChat = expressAsyncHandler(async (req, res) => {
  let users = req.body.users;
  const existChat = await Chat.findOne({ usersRef: [...users, req.user._id] });
  console.log(existChat);
  if (existChat) {
    throw new ApiError("Chat already exists", 400);
  }

  if (users.length < 1) {
    return res.status(400).json({
      message: "More than one user are required to form a group chat",
    });
  }
  if (!users.includes(req.user._id.toString())) {
    users.push(req.user); // Add current user along with all the people
  }

  try {
    let chat;
    if (users.length > 2) {
      chat = {
        chatName: req.body.name,
        usersRef: users,
        isGroup: true,
        groupAdmin: req.user._id,
      };
    } else {
      chat = {
        chatName: req.body.name,
        usersRef: users,
      };
    }
    const groupChat = await Chat.create(chat);

    const createdGroup = await Chat.findOne({ _id: groupChat._id })
      .populate("usersRef", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(createdGroup);
  } catch (error) {
    throw new ApiError(error.message, 400);
  }
});
const renameGroup = expressAsyncHandler(async (req, res) => {
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
const addToGroup = expressAsyncHandler(async (req, res) => {
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
const removeFromGroup = expressAsyncHandler(async (req, res) => {
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

module.exports = {
  accessChat,
  fetchChats,
  createChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
};
