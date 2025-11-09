import  { Router } from "express";
import { allUsers, createUser, loginUser, updateUser,sendFriendRequest, acceptFriendRequest, getSingleUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const userRouter = Router()

userRouter.route('/signup').post(
    upload.single("profile"),
    createUser
)
userRouter.route('/login').post(loginUser)

// userRouter.post("/friend-request/:id",);
userRouter.post("/friend-request/:id", authMiddleware, sendFriendRequest);
userRouter.post("/friend-accept/:id", authMiddleware, acceptFriendRequest);
userRouter.route('/updateUser').post(
    authMiddleware,
    upload.single("image"),
    updateUser
)
userRouter.get("/getSingleUser", authMiddleware, getSingleUser);
userRouter.route('/getAllUsers').get(authMiddleware, allUsers)

export {
    userRouter
}