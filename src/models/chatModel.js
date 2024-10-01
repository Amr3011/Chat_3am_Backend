const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    isGroup: {
      type: Boolean,
      default: false
    },
    usersRef: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
