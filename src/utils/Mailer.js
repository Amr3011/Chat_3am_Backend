const nodemailer = require("nodemailer");
const ApiError = require("./ApiError");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// send email to user
exports.sendMail = async (email, subject, message) => {
  transporter.sendMail(
    {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: message
    },
    (err, info) => {
      if (err) {
        throw new ApiError(err.message, 500);
      }
    }
  );
};
