const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer"); // لإرسال البريد الإلكتروني
const crypto = require("crypto"); // لإنشاء رمز التحقق العشوائي


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

    // Generate verification code
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-character verification code

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      verificationCode,  // تخزين رمز التحقق
      isVerified: false   // حالة التحقق
    });

    await newUser.save();

    // إرسال البريد الإلكتروني برمز التحقق
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your Email",
      text: `Your verification code is: ${verificationCode}`
    };

    await transporter.sendMail(mailOptions);

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
    user.verificationCode = null;  // إزالة رمز التحقق بعد نجاح التحقق
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
