import socket from "../../../Client/my-app/src/utils/socket.js";
import { Chat } from "../model/chat.model.js";
import { Friends } from "../model/friendRequest.model.js";
import { AcceptFriends } from "../model/friends.js";
import { Message } from "../model/message.model.js";
import { User } from "../model/user.model.js";

const onlineUsers = {};

const connectUser = (socket, io) => {
  try {
    const userId = socket.user.id;
    console.log("userIddd ", userId);
    console.log("socket.user ", socket.user);

    console.log("🔗 user connected:", userId, "with socket", socket.id);

    console.log("userId ", userId);

    if (userId) {
      onlineUsers[userId] = socket.id;
    }
    io.emit("online_user", Object.keys(onlineUsers));
  } catch (error) {
    console.log("error on connectUser ", error);
    throw Error("connectUser user failure!!");
  }
};

const disconnectUser = (socket, io) => {
  try {
    console.log(`user disconnected ${socket.id}`);
    const userId = socket.user?.id;
    if (userId && onlineUsers[userId]) {
      delete onlineUsers[userId];
      console.log(`🔴 User ${userId} disconnected`);
    }

    io.emit("disconnect_user", Object.keys(onlineUsers));
  } catch (error) {
    console.log("error on disconnect ", error);
    throw Error("Disconnet user failure!!");
  }
};

const sendFriendRequest = async (senderId, receiverId, io, callback) => {
  try {
    if (senderId === receiverId) {
      return callback({
        success: false,
        message: "User cannot send request to itself",
      });
    }
    const existRequest = await Friends.findOne({ senderId, receiverId });

    if (existRequest) {
      return callback({
        success: false,
        message: "Friend Request Already Sent",
      });
    }

    await Friends.create({
      senderId,
      receiverId,
      status: "pending",
    });

    const populatedRequest = await Friends.findOne({
      senderId,
      receiverId,
    }).populate("senderId", "_id username profile");

    const checkReceiverOnline = onlineUsers[receiverId];
    if (checkReceiverOnline) {
      io.to(checkReceiverOnline).emit("sent_friend_request", {
        senderId: senderId,
        receiverId: receiverId,
        username: populatedRequest.senderId.username,
        profile: populatedRequest.senderId.profile,
      });
    }
    callback({ success: true, message: "Friend request sent successfully" });
  } catch (error) {
    console.log("Error in sendFriendRequest ", error);
    callback({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const acceptFriendRequest = async (senderId, receiverId, io) => {
  try {
    const accept = await AcceptFriends.findOne({
      $or: [
        { userA: senderId, userB: receiverId },
        { userA: receiverId, userB: senderId },
      ],
    });
    if (accept) {
      io.to(onlineUsers[receiverId]).emit("accept_friend_request", {
        success: false,
        message: "Friend Request Already Sent",
      });
      return;
    }
    const acceptfriendRequest = await Friends.findOneAndUpdate(
      { receiverId, senderId, status: "pending" },
      { status: "accepted" },
      { new: true }
    );

    if (!acceptfriendRequest) {
      io.to(receiverId).emit("accept_friend_request", {
        success: false,
        message: "Friend Request not Found",
      });
      return;
    }

    await AcceptFriends.create({
      userA: senderId,
      userB: receiverId,
    });

    let chat = await Chat.findOne({ users: { $all: [senderId, receiverId] } });

    if (!chat) {
      chat = await Chat.create({ users: [senderId, receiverId] });
    }

    const populatedRequest = await Friends.findOne({
      senderId,
      receiverId,
    }).populate("receiverId", "_id username profile");

    const senderSocketId = onlineUsers[senderId];
    if (senderSocketId) {
      io.to(senderSocketId).emit("accept_friend_request", {
        senderId,
        success: true,
        message: `${populatedRequest?.receiverId?.username} accepted your friend request!`,
      });
    }
  } catch (error) {
    io.to(senderId).emit("accept_friend_request", {
      success: false,
      message: error.message || "Something went wrong while accepting request.",
    });
  }
};

const rejectFriendRequest = async (senderId, receiverId, io) => {
  try {
    const rejectRequest = await Friends.findOneAndDelete(
      {
        senderId,
        receiverId,
        status: "pending",
      },
      {
        status: "rejected",
      },
      { new: true }
    );
    await rejectRequest.populate("receiverId", "name");
    if (!rejectRequest) {
      console.log("friend request not found");
      throw Error(`Friend Request not Found`);
    }
    const rejecteruser = onlineUsers[senderId];
    if (rejecteruser) {
      io.to(senderId).emit("reject_friend_request", {
        senderId: senderId,
        name: sendRequest.senderId.name,
      });
    }
  } catch (error) {
    console.log("error in reject friend request ", error);
    throw Error("error in reject friend request");
  }
};

const sendMessage = async (data, id, io) => {
  const { senderId, receiverId, username, chatId, content } = data;

  const room = await Chat.findOne({ _id: chatId })
    .populate("users", "-password")
    .lean();
const user = await User.findById(senderId)
  if (!room) {
    io.to(senderId).emit("send_message", {
      message: `Room with roomId ${chatId} not found`,
      succes: false,
    });
  }

 const message =  await Message.create({
    senderId,
    chatId,
    content,
  });
  
const latestMsg = await Chat.findOne({
  users: { $all: [senderId, receiverId] }
}).sort({ createdAt: -1 });
  latestMsg.latestMessage = content;
 await latestMsg.save()
  io.to(chatId).emit("send_message", {
    chatId,
    senderId:{
      _id:user._id,
      username:user.username,
      profile:user.profile
    },
    receiverId,
    content
  });

  //   if (onlineUsers[receiverId]) io.to(onlineUsers[receiverId]).emit("send_message", create_message);
  // if (onlineUsers[senderId]) io.to(onlineUsers[senderId]).emit("send_message", create_message);

  // io.to(onlineUsers[receiverId]).emit("send_message", {
  //   message: create_message,
  //   username,
  //   success: true,
  // });
};

export {
  connectUser,
  disconnectUser,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  sendMessage,
};
