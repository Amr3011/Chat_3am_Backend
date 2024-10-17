const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    chatName: {
      type: String,
      required: [true, "Please provide a Group Name"],
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    usersRef: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
