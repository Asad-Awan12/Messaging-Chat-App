import { Message } from "../model/message.model.js";
import { Notification } from "../model/notification.model.js";

const sendNotification = async (req, res) => {
  try {
    const { notification } = req.body;
    const alreadyExist = await Notification.findOne({
      notificationId: notification,
    });
    if (alreadyExist) {
      return res
        .status(400)
        .json({ message: "You have already send notification" });
    }
    const newNotification = await Notification.create({
      user: req.user._id,
      notificationId: notification,
    })
      .populate("user", "-password")
      .populate("notificationId");

    newNotification = await Notification.populate(newNotification, {
      path: "notificationId.sender",
      select: "email image username",
    });
    newNotification = await Notification.populate(newNotification, {
      path: "notificationId.chatId",
      select: "chatname isGroupCaht latestMessage users",
    });
    newNotification = await Notification.populate(newNotification, {
      path: "notificationId.chatId.users",
      select: "name image email",
    });
    return res
      .status(201)
      .json({ message: "Successfully send Notification", newNotification });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({ message: "Error in sending notification" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const delete_Notification = await Notification.findByIdAndDelete({
      chatId: notificationId,
    });
    return res
      .status(201)
      .json({
        message: "Successfully Delete Notification",
        delete_Notification,
      });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({ message: "Error in deleting notification" });
  }
};

const getNotification = async (req, res) => {
  try {
    var notifications = await Notification.find({
      user: req.user._id,
    })
      .populate("user", "-password")
      .populate("notificationId");
    notifications = await Notification.populate(notifications, {
      path: "notificationId.sender",
      select: "name image email",
    });
    notifications = await Notification.populate(notifications, {
      path: "notificationId.chatId",
      select: "chatname isGroupChat latestMessage users",
    });
    notifications = await Notification.populate(notifications, {
      path: "notificationId.chatId.users",
      select: "name image email",
    });
    return res.status(201).json({message:"Successfully Fetch Notification",notifications})
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({ message: "Error in Fetching notification" });
  }
};

export { sendNotification, deleteNotification,getNotification };
