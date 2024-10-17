const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.createChatValidator = [
  check("users.*")
    .notEmpty()
    .withMessage("users is empty")
    .isMongoId()
    .withMessage("invalid MongoId"),
  check("name").notEmpty(),
  validatorMiddleware
];

exports.searchChatValidator = [
  check("chatId")
    .notEmpty()
    .withMessage("chatId is empty")
    .isMongoId()
    .withMessage("invalid MongoId"),
  ,
  check("searchTerm").notEmpty().withMessage("searchTerm is empty"),
  ,
  validatorMiddleware
];
