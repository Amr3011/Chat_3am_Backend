const express = require("express");
const {
  register,
  login,
  allUsers,
  deleteUser,
  forgotPassword,
  resetPassword
} = require("../controllers/userController");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);

router
  .route("/")
  .delete(authMiddleware, deleteUser)
  .get(authMiddleware, allUsers);

module.exports = router;
