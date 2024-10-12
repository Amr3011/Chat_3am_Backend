const express = require("express");
const {
  register,
  login,
  deleteUser
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.route("/").delete(authMiddleware, deleteUser);

module.exports = router;
