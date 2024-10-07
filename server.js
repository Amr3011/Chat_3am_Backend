const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const globalError = require("./src/middlewares/errorMiddleware.js");
const morgan = require("morgan");
const ApiError = require("./src/utils/apiError.js");
const cors = require("cors");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Routes
app.get("/", (req, res) => {
  res.send("Hello Friends");
});

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

process.on("unhandledRejection", (err) => {
  console.error(err.name, err.message);
  server.close(() => {
    console.error("UNHANDLED REJECTION! Shutting down...");
    process.exit(1);
  });
});
