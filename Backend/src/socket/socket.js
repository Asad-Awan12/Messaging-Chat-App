import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

export function getSocketId(userId) {
  return onlineUsers[userId];
}

const onlineUsers = {};

io.on("connection", (socket) => {
  console.log(`user connected ${socket.id}`);

  const userId = socket.handshake.query.userId;
  if (userId) {
    onlineUsers[userId] = socket.id;
  }
  io.emit("onlineuser", Object.keys(onlineUsers));

  socket.on("disconnect", () => {
    console.log(`user disconnected ${socket.id}`);
    delete onlineUsers[userId];
    io.emit("onlineuser", Object.keys(onlineUsers));
  });
});

export { io, app, server };
