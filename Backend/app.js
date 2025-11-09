import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import { userRouter } from "./src/Routes/user.route.js"
import { chatRouter } from "./src/Routes/chat.route.js"
import { notificationRouter } from "./src/Routes/notification.route.js"
import { messageRouter } from "./src/Routes/message.route.js"
import { friendRequestRouter } from "./src/Routes/friendRequets.route.js"

app.use("/api/auth",userRouter)
app.use('/chat/api',chatRouter)
app.use('/notification',notificationRouter)
app.use('/message/api',messageRouter)
app.use('/friends/api',friendRequestRouter)



export { app }