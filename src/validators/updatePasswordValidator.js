const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");


exports.updatePasswordValidator = [
    check("newPassword")
  .isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
  .withMessage("Password must be at least 8 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one symbol."),
  validatorMiddleware
];
