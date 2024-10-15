const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.loginValidator = [
  check("email").custom((value) => {
    // Check if the value is an email
    const isEmail = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com)$/.test(value);
    if (isEmail) return true;

    // Check if the value is a phone number (you can modify the regex for your country's phone format)
    const isPhone = /^01[0-2,5]{1}[0-9]{8}$/.test(value);
    if (isPhone) return true;

    // Check if the value is a username (define your own username validation rules)
    const isUsername = /^[a-zA-Z0-9_.-]+$/.test(value);
    if (isUsername) return true;

    // If none of the above conditions are met, throw an error
    throw new Error("Input must be a valid email, username, or phone number");
  }),
  check("password")
    .isStrongPassword()
    .withMessage("Password is not strong enough"),
  validatorMiddleware
];
