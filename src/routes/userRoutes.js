const express = require("express");
const router = express.Router();
const { allUsers } = require("../controllers/userController");
// const { protect } = require("../middlewares/authMiddleware");

router.route("/").get(allUsers);

module.exports = router;