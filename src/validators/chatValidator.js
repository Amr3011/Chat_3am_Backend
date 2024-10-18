const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.createGroupChatValidator = [
  check("users.*")
    .notEmpty()
    .withMessage("users is empty")
    .isMongoId()
    .withMessage("invalid MongoId"),
  check("chatName").notEmpty().withMessage("chatName is empty"),
  validatorMiddleware
];
