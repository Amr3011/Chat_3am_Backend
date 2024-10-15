const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.forgotPasswordValidator = [
  check("username").isEmail().withMessage("Must be a valid email address"),
  validatorMiddleware
];
