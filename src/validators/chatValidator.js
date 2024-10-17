const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.createChatValidator = [
  check("users.*")
    .notEmpty()
    .withMessage("users is empty")
    .isMongoId()
    .withMessage("invalid MongoId"),
  check("name").notEmpty(),
  validatorMiddleware,
];
