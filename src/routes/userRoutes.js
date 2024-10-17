const express = require("express");
const {
  register,
  login,
  allUsers,
  deleteUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  logout,
  updateUser
} = require("../controllers/userController");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  forgotPasswordValidator
} = require("../validators/forgotPasswordValidator");
const { loginValidator } = require("../validators/loginValidator");
const { RegisterValidator } = require("../validators/RegisterValidator");

router.post("/register", RegisterValidator, register);
router.post("/login", loginValidator, login);
router.post("/forgot-password", forgotPasswordValidator, forgotPassword);
router.post("/verify", verifyEmail);
router.post("/reset-password/:resetToken", resetPassword);
router.post("/logout", logout);


router
  .route("/")
  .put(authMiddleware, updateUser)
  .delete(authMiddleware, deleteUser)
  .get(authMiddleware, allUsers);

module.exports = router;
