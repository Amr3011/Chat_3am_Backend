const express = require("express");
const {
  register,
  login,
  allUsers,
  deleteUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require("../controllers/userController");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  forgotPasswordValidator
} = require("../validators/forgotPasswordValidator");
const { loginValidator } = require("../validators/loginValidator");

router.post("/register", register);
router.post("/login", loginValidator,login);
router.post("/forgot-password", forgotPasswordValidator, forgotPassword);
router.post("/verify", verifyEmail);
router.post("/reset-password/:resetToken", resetPassword);

router
  .route("/")
  .delete(authMiddleware, deleteUser)
  .get(authMiddleware, allUsers);

module.exports = router;
