import { Chat } from "../model/chat.model.js";
import { Friends } from "../model/friendRequest.model.js";
import { AcceptFriends } from "../model/friends.js";
import { Message } from "../model/message.model.js";
import { User } from "../model/user.model.js";
// import { Socket } from "socket.io";
// import { getSocketId, io } from "../socket/socket";

// const sendFriendrequest = async (req, res) => {
//   try {
//     const { receiverId } = req.body;
//     const senderId = req.user.id;

//     if (senderId.toString() === receiverId) {
//       res
//         .status(400)
//         .json({ message: "User cannot send Friend Request itself" });
//     }

//     const exist = await Friends.findOne({
//       $or: [
//         { senderId: senderId, receiverId: receiverId },
//         { senderId: receiverId, receiverId: senderId },
//       ],
//     });
//     if (exist) {
//       res.status(400).json({ message: "Friend Request Alredy Sent" });
//     }
//     const request = await Friends.create({ senderId, receiverId });
//     const receiverSocketId = getSocketId(receiverId);
//     if (receiverSocketId) {
//       io.to(receiverId).emit("friend request", senderId);
//     }

//     return res
//       .status(200)
//       .json({ message: "User send Friend Request Successfully", request });
//   } catch (error) {
//     console.log("error ", error);
//     return res.status(500).json({ message: "Internal Server error" });
//   }
// };

// const acceptFriendRequest = async (req, res) => {
//   try {
//     const { requestId } = req.body;
//     const request = await Friends.findById(requestId);

//     if (!request || request.receiverId.toString() !== req.user.id.toString()) {
//       res.status(400).json({ message: "Friend Request not Found" });
//     }

//     request.status = "accepted";
//     request.save();

//     const requestSocketId = getSocketId(requestId);
//     if (requestSocketId) {
//       io.to(requestId).emit("accept friend request", request.receiverId);
//     }
//     return res
//       .status(200)
//       .json({ message: "Friend Request Accepted Successfully" });
//   } catch (error) {
//     console.log("error", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };


const getRequests = async(req,res)=>{
  try {
    const userId = req.user.id
    if (!userId) {
      throw Error("UnAuthorized User") 
    }
    const findRequests = await Friends.find({receiverId:userId}).populate("senderId","_id username profile");
    return res.status(200).json({message:"Get Users Successfully",findRequests})
  } catch (error) {
    console.log("error ",error);
    return res.status(500).json({message:"Internal server Error",error:error.message})
  }
}

 const getAllFriends = async (req, res) => {
  try {
    const userId = req.user.id; // get from JWT middleware

    // find all chats where this user is a participant
    const chats = await Chat.find({ users: userId })
      .populate("users", "username profile")
      .lean();

    // attach the latest message to each chat
    const chatsWithLatest = await Promise.all(
      chats.map(async (chat) => {
        const latestMsg = await Message.findOne({ chatId: chat._id })
          .sort({ createdAt: -1 })
          .lean();

        // Filter out the logged-in user to get only the friend(s)
        const friends = chat.users.find(
          (u) => u._id.toString() !== userId.toString()
        );

        return {
          _id: chat._id,
          ...friends, // only friend info
          latestMessage: latestMsg || null,
        };
      })
    );

    res.status(200).json(chatsWithLatest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// const getAllFriends = async(req,res)=>{
//   try {
//     const userId = req.user.id;
//     const findFriends = await AcceptFriends.find({
//       $or:[
//         {userA:userId},
//         {userB:userId}
//       ]
//     })
//     .populate("userA","username profile ")
//     .populate("userB","username profile ")
//     if (!findFriends) {
//       res.status(404).json({message:"No Friends Found"})
//     }
//      const friends = findFriends.map((friend) =>
//       friend.userA._id.toString() === userId.toString() ? friend.userB : friend.userA
//     );
//     return res.status(200).json({message:"Get All Friends Successfully",friends})
//   } catch (error) {
//     console.log("error ",error);
//     res.status(500).json({message:"Internal Server Error"})
//   }
// }

export {
  //  sendFriendrequest,
  //   acceptFriendRequest,
    getRequests,
    getAllFriends,
  };
