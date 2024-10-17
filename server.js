const { Server: ioServer } = require("socket.io");
const server = require("./app");

//Setup Socket.io
const io = new ioServer(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

io.on("connection", (socket) => {
  process.env.NODE_ENV === "development" &&
    console.log("Connected to socket.io");
  socket.on("setup", (userId) => {
    socket.join(userId);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    process.env.NODE_ENV === "development" &&
      console.log(`user ${socket.id} joining room ${room}`);
    socket.join(room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));

  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    let chat = newMessageReceived.chatRef;

    if (!chat.usersRef)
      return process.env.NODE_ENV === "development"
        ? console.log("chat.users not defined")
        : null;

    chat.usersRef.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    process.env.NODE_ENV === "development" && console.log("User Disconnected");
    socket.leave(userId);
  });
});

process.on("unhandledRejection", (err) => {
  console.error(err.name, err.message);
  server.close(() => {
    console.error("UNHANDLED REJECTION! Shutting down...");
    process.exit(1);
  });
});
