const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true
    },
    email: {
      type: String,
      match: /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/,
      required: [true, "Please provide an email"],
      unique: true
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6
    },
    avatar: {
      type: String,
      default: ""
    },
    phone: {
      required: [true, "Please provide a phone number"],
      type: String,
      default: ""
    },
    verificationCode: {
       type: String 
      },
    isVerified: { 
      type: Boolean, default: false 
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
