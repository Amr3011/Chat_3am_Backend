const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.messageValidator = [
  check("content").notEmpty().withMessage("content is required"),
  check("contentType").notEmpty().withMessage("contentType is required"),
  check("chatId")
    .notEmpty()
    .withMessage("chatId is required")
    .isMongoId()
    .withMessage("invalid chatId"),
  validatorMiddleware
];
