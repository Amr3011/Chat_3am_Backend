const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.RegisterValidator = [
    check("email").custom((value) => {
        // Check if the value is an email
        const isEmail = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com)$/.test(value);
        if (isEmail) return true;

        // If none of the above conditions are met, throw an error
        throw new Error("Invalid email. Only Gmail and Outlook email addresses are allowed.");
      }),

      check("phone").custom((value) => {
        // Check if the value is a phone number (you can modify the regex for your country's phone format)
        const isPhone = /^01[0-2,5]{1}[0-9]{8}$/.test(value);
        if (isPhone) return true;
        
        // If none of the above conditions are met, throw an error
        throw new Error("Invalid phone number. Please enter a valid Egyptian phone number.");
      }),

      check("password")
  .isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
  .withMessage("Password must be at least 8 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one symbol."),

      check("username").custom((value) => {
        // Check if the value is a username (define your own username validation rules)
        const isUsername = /^[a-zA-Z0-9_.-]+$/.test(value);
        if (isUsername) return true;
        
        // If none of the above conditions are met, throw an error
        throw new Error("Username can only contain letters, numbers, dots, underscores, and hyphens.");
      }),
      validatorMiddleware
];
