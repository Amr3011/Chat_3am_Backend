const asynchHandler = require("express-async-handler");

const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//creating and fetching one-one chat
const accessChat = asynchHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    console.log("userId param not sent with request");
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
    res.send(isChat[0]);
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

      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});
const fetchChats = asynchHandler(async (req, res) => {
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
        res.status(200).send(results);
      });

    // );
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
const createGroupChat = asynchHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fil all the feilds" });
  }

  let users = JSON.parse(req.body.users);
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }
  //To include the current user that logged in
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      usersRef: users,
      isGroup: true,
      groupAdmin: req.user,
    });

    const createdGroup = await Chat.findOne({ _id: groupChat._id })
      .populate("usersRef", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(createdGroup);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
const renameGroup = asynchHandler(async (req, res) => {
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
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});
const addToGroup = asynchHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const isAdmin = await Chat.findOne({ _id: chatId, groupAdmin: req.user._id });
  if (!isAdmin) {
    res.status(404);
    throw new Error("You Are not authorized");
  }
  const updatedGroupMembers = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { usersRef: userId } },
    { new: true }
  )
    .populate("usersRef", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedGroupMembers) {
    res.status(404);
    throw new Error("Group Not Found");
  } else {
    res.json(updatedGroupMembers);
  }
});
const removeFromGroup = asynchHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const isAdmin = await Chat.findOne({ _id: chatId, groupAdmin: req.user._id });
  if (!isAdmin) {
    res.status(404);
    throw new Error("You Are not authorized");
  }
  const updatedGroupMembers = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { usersRef: userId } },
    { new: true }
  )
    .populate("usersRef", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedGroupMembers) {
    res.status(404);
    throw new Error("Group Not Found");
  } else {
    res.json(updatedGroupMembers);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
};
