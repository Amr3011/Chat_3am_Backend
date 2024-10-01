const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a sender"]
    },
    content: {
      type: String,
      required: [true, "Please provide a content"]
    },
    contentType: {
      type: String,
      default: "text"
    },
    chatsRef: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
      }
    ],
    isSeen: {
      type: Boolean,
      default: false
    },
    isDelivered: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
