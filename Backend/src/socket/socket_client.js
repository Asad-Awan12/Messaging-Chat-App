import { Server } from "socket.io";
import {
  acceptFriendRequest,
  connectUser,
  disconnectUser,
  sendFriendRequest,
  sendMessage,
} from "./connection_methods.js";
import { socketAuth } from "../middlewares/authMiddleware.js";

let io;

export const configureSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "http://localhost:5173" },
    methods: ["GET", "POST"],
    credentials: true,
    pingInterval: 20000,
    pingTimeout: 30000,
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`A socket connection has been established ${socket.id}`);
    connectUser(socket, io);
    socket.on("disconnect", () => disconnectUser(socket, io));
      socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined room ${chatId}`);
  });
    socket.on("sent_friend_request", async (data,callback) => {
      const { receiverId } = data;
      const senderId = socket.user.id;
      await sendFriendRequest(senderId, receiverId, io,callback);
    });
    //  sendFriendRequest(senderId,receiverId,io));
    socket.on("accept_friend_request", async (data) => {
      const { senderId } = data;
      const receiverId = socket.user.id;
      await acceptFriendRequest(senderId, receiverId, io);
    });
    //  acceptFriendRequest(senderId,receiverId,io));
    socket.on("reject_friend_request", async (data) => {
      const { senderId } = data;
      const receiverId = socket.user.id;
      await rejectFriendRequest(senderId, receiverId, io, callback);
    });
    socket.on("send_message",(data)=>sendMessage(data,socket.id,io))
     socket.on("typing", ({ chatId, senderId ,receiverId}) => {
    socket.to(chatId).emit("typing", { chatId, senderId ,receiverId});
  });
   socket.on("stop_typing", ({ chatId, senderId ,receiverId}) => {
    socket.to(chatId).emit("stop_typing", { chatId, senderId ,receiverId});
  });
  });
};
