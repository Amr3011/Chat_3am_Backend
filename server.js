const { Server } = require("socket.io");
const http = require("http");
const PORT = process.env.PORT || 5000;
const app = require("./app");

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on http://127.0.0.1:${PORT}`
  );
});

//Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL
  }
});

io.on("connection", (socket) => {
  process.env.NODE_ENV === "development" &&
    console.log(`⚡: ${socket.id} user just connected`);

  socket.on("subscribe", (userId) => {
    process.env.NODE_ENV === "development" &&
      console.log(`⚡: ${socket.id} subscribe to room ${userId}`);
    socket.join(userId);
    socket.emit("connected");
  });

  socket.on("joinChat", (room) => {
    process.env.NODE_ENV === "development" &&
      console.log(`⚡: ${socket.id} joined room ${room}`);
    socket.join(room);
  });

  socket.on("typing", (room, username) => {
    process.env.NODE_ENV === "development" &&
      console.log(`⚡: ${username} is typing in room ${room}`);
    socket.broadcast.to(room).emit("typing", username);
  });

  socket.on("stopTyping", (room) => {
    process.env.NODE_ENV === "development" &&
      console.log(`⚡: ${socket.id} stopped typing in room ${room}`);
    socket.broadcast.to(room).emit("stopTyping");
  });

  socket.on("newMessage", (message) => {
    process.env.NODE_ENV === "development" &&
      console.log(`⚡: ${socket.id} sent message: ${message}`);
    socket.broadcast.to(message.chatRef._id).emit("messageReceived", message);
  });

  socket.on("messageReceived", (message) => {
    process.env.NODE_ENV === "development" &&
      console.log(`⚡: ${socket.id} received message: ${message}`);
    socket.broadcast.to(message.chatRef._id)("messageReceived", message);
  });

  socket.on("newChat", (chat, creatorId) => {
    process.env.NODE_ENV === "development" &&
      console.log(`⚡: ${socket.id} create chat: ${chat}`);
    chat.usersRef.forEach((user) => {
      if (user._id === creatorId) {
        return;
      }
      socket.join(user._id);
      socket.broadcast.to(user._id).emit("chatCreated", chat);
      socket.leave(user._id);
    });
  });

  // socket.on("newNotification", async (notification) => {
  //   process.env.NODE_ENV === "development" &&
  //     console.log(
  //       `⚡: ${socket.id} sent notification: ${JSON.stringify(notification)}`
  //     );
  //   socket.join(notification.receiver._id);
  //   socket.broadcast
  //     .to(notification.receiver._id)
  //     .emit("notificationReceived", notification);
  //   socket.leave(notification.receiver._id);
  // });

  socket.on("leaveChat", (chatId) => {
    socket.leave(chatId);
    process.env.NODE_ENV === "development" &&
      console.log(`⚡: ${socket.id} left chat ${chatId}`);
  });

  socket.on("unsubscribe", (userId) => {
    socket.leave(userId);
    process.env.NODE_ENV === "development" &&
      console.log(`⚡: ${socket.id} left room ${userId}`);
  });

  socket.on("disconnect", () => {
    socket.leaveAll();
    process.env.NODE_ENV === "development" &&
      console.log(`⚡: ${socket.id} user just disconnected`);
  });
});

process.on("unhandledRejection", (err) => {
  console.error(err.name, err.message);
  server.close(() => {
    console.error("UNHANDLED REJECTION! Shutting down...");
    process.exit(1);
  });
});
