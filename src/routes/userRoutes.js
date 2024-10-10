const express = require('express');
const { register, login, verifyEmail  } = require('../controllers/userController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify', verifyEmail);


module.exports = router;
