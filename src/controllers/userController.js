const asynchHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//api/user/serach=
exports.allUsers = asynchHandler(async (req, res) => {
  //req.query.search this like useParams

  let filter = {};
  const { search } = req.query;
  if (search) {
    filter = {
      $or: [
        //option "i" to make it case insensitive
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    };
  }

  const users = await User.find(filter);
  res.json(users);
});


// Register a new user
exports.register = async (req, res) => {
  const { username, email, password, phone } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT));
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
    });

    await newUser.save();

    const {password:_,...others} = newUser._doc;

    res
      .status(201)
      .json({ message: "User registered successfully", user: others });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    const {password:_, ...others} = user._doc;
    res.json({ message: "Login successful", token, user:others });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
