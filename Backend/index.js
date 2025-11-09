import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import colors from "colors";
import { app } from "./app.js";
import { Server } from "socket.io";
import http from "http";
import { Message } from "./src/model/message.model.js";
import { Chat } from "./src/model/chat.model.js";
import { configureSocket } from "./src/socket/socket_client.js";

const server = http.createServer(app);

dotenv.config({
  path: "./.env",
});


connectDB()
.then(() => {
    configureSocket(server)
    server.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})


// connectDB()
//   .then(() => {
//     const PORT = process.env.PORT || 8000;


//     const server = http.createServer(app);
//     const io = new Server(server, {
//       cors: {
//         origin: "http://localhost:5173",
//         methods: ["GET", "POST"],
//       },
//     });

//     io.on("connection", (socket) => {
//       console.log(" User connected:", socket.id);

//       socket.on("setup", (userId) => {
//         onlineUsers.set(userId, socket.id);
//         const users = Array.from(onlineUsers.keys());
//         io.emit("online-users", users);
//       });

//       socket.on("join", (userId) => {
//         socket.join(userId);
//         console.log(`User ${userId} joined room`);
//       });

//       //  Join chat room and send chat history
//       socket.on("join chat", async (chatId) => {
//         socket.join(chatId);
//         console.log(`User ${socket.id} joined chat room: ${chatId}`);

//         try {
//           const messages = await Message.find({ chat: chatId })
//             .populate("sender", "username image")
//             .populate("chat");

//           socket.emit("chat history", messages);
//         } catch (error) {
//           console.error("Failed to fetch chat history:", error);
//           socket.emit("chat history", []); // send empty if error
//         }
//       });

//       // typing
//       socket.on("typing", ({ chatId, user }) => {
//         socket.in(chatId).emit("typing", { chatId, user });
//       });

//       socket.on("stop typing", ({ chatId }) => {
//         socket.in(chatId).emit("stop typing", { chatId });
//       });

//       //  Send message
//       socket.on("send message", async ({ chatId, content, senderId }) => {
//         try {
//           let message = await Message.create({
//             chat: chatId,
//             content,
//             sender: senderId,
//           });

//           message = await message.populate("sender", "username image");
//           message = await message.populate("chat");

//           await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

//           io.to(chatId).emit("new message", message);
//         } catch (error) {
//           console.error("Error sending message:", error);
//         }
//       });

//       socket.on("disconnect", () => {
//         for (const [key, value] of onlineUsers.entries()) {
//           if (value === socket.id) {
//             onlineUsers.delete(key);
//             break;
//           }
//         }
//         const users = Array.from(onlineUsers.keys());
//         io.emit("online-users", users);
//         console.log("User disconnected:", socket.id);
//       });

//       socket.on("disconnect", () => {
//         console.log("User disconnected:", socket.id);
//       });
//     });

//     app.set("io", io);

//     server.listen(PORT, () => {
//       console.log(colors.brightGreen(`Server is running on port: ${PORT}`));
//     });
//   })
//   .catch((err) => {
//     console.log("MONGO DB connection failed !!! ", err);
//   });
