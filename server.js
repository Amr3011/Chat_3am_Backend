const { Server: ioServer } = require("socket.io");
const server = require("./app");

//Setup Socket.io
const io = new ioServer(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173/"
  }
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");
});

process.on("unhandledRejection", (err) => {
  console.error(err.name, err.message);
  server.close(() => {
    console.error("UNHANDLED REJECTION! Shutting down...");
    process.exit(1);
  });
});
