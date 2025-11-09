import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getAllFriends, getRequests } from "../controllers/friendRequest.controller.js";

const friendRequestRouter = Router();

friendRequestRouter.get("/get_friend_requests",authMiddleware,getRequests)
friendRequestRouter.get("/all_friends",authMiddleware,getAllFriends)

export {
    friendRequestRouter
}