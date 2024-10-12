const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); 
const { sendMail } = require("../utils/Mailer");

//api/user/?search=keyword
exports.allUsers = expressAsyncHandler(async (req, res) => {
  //req.query.search this like useParams

  let filter = {};
  const { search } = req.query;
  if (search) {
    filter = {
      $or: [
        //option "i" to make it case insensitive
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ]
    };
  }

  const users = await User.find(filter);
  res.json(users);
});

// Register a new user
exports.register = async (req, res) => {
  const { username, email, password, phone, name } = req.body;

  try {
    // Check if the user already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "email already exists" });
    }
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "phone already exists" });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "username already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT));
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification code
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-character verification code

    // Create new user
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      phone,
      verificationCode,     
      isVerified: false   
    });

    await newUser.save();

    
    const subject = "Verify your Email";
    const message = `Your verification code is: ${verificationCode}`;

    
    await sendMail(user.email, subject, message);

    const { password: _, ...others } = newUser._doc;
    res.status(201).json({ message: "User registered successfully, check your email for verification code", user: others });


  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ $text: { $search: email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Verify your email" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
    const { password: _, ...others } = user._doc;
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: eval(process.env.COOKIE_EXPIRE)
      })
      .json({ message: "Login successful", user: others });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    console.log(user);
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    console.log(typeof(user.verificationCode))
    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationCode = null;   
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// delete user
exports.deleteUser = expressAsyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.user._id);
  if (user) {
    res
      .clearCookie("token")
      .status(200)
      .json({ message: "User deleted successfully" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

exports.forgotPassword = expressAsyncHandler(async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ $text: { $search: username } });
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  // send email to user
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: Date.now() + eval(process.env.RESET_TOKEN_EXPIRE)
  });
  user.resetToken = token;
  user.resetTokenExpire = Date.now() + eval(process.env.RESET_TOKEN_EXPIRE);
  const subject = "Password Reset";
  const message = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">Password Reset</h2>
      <p>Dear ${user.username},</p>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${process.env.CLIENT_URL}/reset-password/${user.resetToken}" style="color: #1a73e8;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <p>Thank you,</p>
      <p>Geeks3am</p>
    </div>
  `;
  await sendMail(user.email, subject, message);
  res.json({ message: "Email sent to user" });
});

exports.resetPassword = expressAsyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;
  if (!resetToken) {
    throw new ApiError("Invalid token", 400);
  }
  const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  const salt = await bcrypt.genSalt(parseInt(process.env.SALT));
  const hashedPassword = await bcrypt.hash(password, salt);
  user.password = hashedPassword;
  user.resetToken = "";
  user.resetTokenExpire = "";
  await user.save();
  res.json({ message: "Password reset successful" });
});
