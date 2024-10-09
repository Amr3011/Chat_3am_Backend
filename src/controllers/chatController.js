const asynchHandler = require("express-async-handler");

const Chat = require("../models/chatModel");

//creating and fetching one-one chat
const accessChat = asynchHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    console.log("userId param not sent with request");
    return res.sendStatus(400);
  }
});
const fetchChats = asynchHandler(async (req, res) => {});
const createGroupChat = asynchHandler(async (req, res) => {});
const renameGroup = asynchHandler(async (req, res) => {});
const removeFromGroup = asynchHandler(async (req, res) => {});
const addToGroup = asynchHandler(async (req, res) => {});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
};
