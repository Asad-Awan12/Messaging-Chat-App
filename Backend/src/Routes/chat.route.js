import { Router } from "express";
import { accessChat,addToGroup,removeFromGroup,createGroupChat,fetchChats,renameGroup, getAllChatRooms, getRoomForUsers } from "../controllers/chat.controller.js";
// import {
//   accessChat,
//   addToGroup,
//   createGroupChat,
//   fetchChats,
//   removeFromGroup,
//   renameGroup,
// } from "../controllers/chat.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const chatRouter = Router();
// api that now use
chatRouter.route("/get_all_chats").get(authMiddleware, getAllChatRooms);
chatRouter.route("/get_user_chatroom").post(authMiddleware, getRoomForUsers);
// 

chatRouter.route("/").post(authMiddleware, accessChat);
chatRouter.route("/getAllChats").get(authMiddleware,fetchChats);
chatRouter.route("/create_group").post(authMiddleware,createGroupChat);
chatRouter.route("/rename_group").post(authMiddleware,renameGroup);
chatRouter.route("/add").post(authMiddleware,addToGroup);
chatRouter.route("/remove").post(authMiddleware,removeFromGroup);

export { chatRouter };
