const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const authMiddleware = expressAsyncHandler(async (req, res, next) => {
  const token = req.cookie.token;
  if (!token) {
    return res.status(401).json({ message: "You are not authenticated" });
  }
  const { id } = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(id);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  req.user = user;
  next();
});

module.exports = authMiddleware;
