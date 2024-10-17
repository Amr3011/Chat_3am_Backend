const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const globalError = require("./src/middlewares/errorMiddleware.js");
const morgan = require("morgan");
const ApiError = require("./src/utils/ApiError.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Load env vars
dotenv.config();

const userRoutes = require("./src/routes/userRoutes");
const chatRoutes = require("./src/routes/chatRoutes.js");
// const messageRoutes = require("./src/routes/messageRoutes.js");

// Connect to database
connectDB();

const app = express();

// middlewares
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// mount Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
// app.use("/api/message", messageRoutes);

// Handle errors
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalError);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on http://127.0.0.1:${PORT}`
  );
});

module.exports = server;
