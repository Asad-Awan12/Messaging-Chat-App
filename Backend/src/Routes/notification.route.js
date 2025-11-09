import { Router } from "express";
import { deleteNotification, sendNotification } from "../controllers/notification.controller.js";

const notificationRouter = Router()

notificationRouter.route('/').post(sendNotification)
notificationRouter.route('/delteNotification').post(deleteNotification)
notificationRouter.route('/getNotifications').get(deleteNotification)

export{
    notificationRouter
}