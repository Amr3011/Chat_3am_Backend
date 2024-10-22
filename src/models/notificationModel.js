const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    receiver: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    ],
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    chatRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat"
    }
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
