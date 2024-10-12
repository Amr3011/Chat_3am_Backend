const express = require("express");
const {
  register,
  login,
  allUsers,
  deleteUser
} = require("../controllers/userController");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router
  .route("/")
  .delete(authMiddleware, deleteUser)
  .get(authMiddleware, allUsers);

module.exports = router;
