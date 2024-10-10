const express = require('express');
const { register, login } = require('../controllers/userController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify', verify);


module.exports = router;
