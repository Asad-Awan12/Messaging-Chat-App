import { Router } from "express";
import { fetchMessage, getAllMessages, getLatestMessage, sendMessage } from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const messageRouter = Router();

messageRouter.route('/').post(authMiddleware, sendMessage)
messageRouter.route('/getAllMessages/:userId').get(authMiddleware,fetchMessage)
messageRouter.route('/allmessages').get(authMiddleware,getAllMessages)
messageRouter.route('/latestMessage/:userId').get(authMiddleware,getLatestMessage)

export{
    messageRouter
}