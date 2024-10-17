

const mongoose = require("mongoose");

const personalinfoSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
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
        phone: {
            type: Number,
            required: true,
            unique: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    { timestamps: true }
);

const PersonalInfo = mongoose.model("PersonalInfo", personalinfoSchema);

module.exports = PersonalInfo;




