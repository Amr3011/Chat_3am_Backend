const express = require('express');
const { register, login, allUsers } = require('../controllers/userController');
const router = express.Router();

router.route("/").get(allUsers);
router.post('/register', register);
router.post('/login', login);

module.exports = router;
