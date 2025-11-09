import { Chat } from "../model/chat.model.js";
import { User } from "../model/user.model.js";
import { Message } from "../model/message.model.js";

export const getAllChatRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatRooms = await Chat.find({ users: { $in: [userId] } }).populate(
      "users",
      "-password"
    );
    if (!chatRooms) {
      res.status(404).json({ message: "chat room does not found" });
    }
    return res.status(200).json({
      message: "Successfully get all chat rooms",
      chatRooms,
    });
  } catch (error) {
    console.log("error ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getRoomForUsers = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const room = await Chat.findOne({
      users: { $all: [senderId, receiverId] },
    }).populate('users',"username profile");
    if(!room){
      return res.status(404).json({message:"Room does not found!!"})
    }

    return res
      .status(200)
      .json({ message: "Get user room successfully", room });
  } catch (error) {
    console.log("error ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Unauthorized User" });
  }

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "username email image",
    });

    if (isChat.length > 0) {
      return res.status(200).json(isChat[0]);
    } else {
      const chatData = {
        chatname: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createChat = await Chat.create(chatData);
      const fullChat = await Chat.findById(createChat._id).populate(
        "users",
        "-password"
      );

      return res
        .status(201)
        .json({ message: "Chat created successfully", chat: fullChat });
    }
  } catch (error) {
    console.error("Error in accessChat:", error);
    return res.status(500).json({ message: "Error accessing chat" });
  }
};

export const fetchChats = async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password -refreshToken")
      .populate("groupAdmin", "-password -refreshToken")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "username email image",
    });

    return res.status(200).json(chats);
  } catch (error) {
    console.error("Error in fetchChats:", error);
    return res.status(500).json({ message: "Error fetching chats" });
  }
};

export const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  let users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .json({ message: "More than 2 users are required to form a group chat" });
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatname: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(201).json(fullGroupChat);
  } catch (error) {
    console.error("Error in createGroupChat:", error);
    return res.status(500).json({ message: "Error creating group chat" });
  }
};

export const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatname: chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    return res.status(404).json({ message: "Chat not found" });
  } else {
    res.json(updatedChat);
  }
};

export const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    return res.status(404).json({ message: "Chat not found" });
  } else {
    res.json(added);
  }
};

export const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    return res.status(404).json({ message: "Chat not found" });
  } else {
    res.json(removed);
  }
};

// import { json } from "express";
// import { Chat } from "../model/chat.model.js";

// const accessChat = async (req, res) => {
//   const { userId } = req.body;
//   if (!userId) {
//     return res.status(400).json({ message: "Unauthorized User" });
//   }
//   const isChat = await Chat.find({
//     isGroupCaht: false,
//     $and: [
//       { users: { $elemMatch: { $eq: req.user._id } } },
//       { users: { $elemMatch: { $eq: userId } } },
//     ],
//   })
//     .populate("users", "-password")
//     .populate("latestMessage");
//   isChat = await User.populate(isChat, {
//     path: "latestMessage.sender",
//     select: "username email image",
//   });
//   if (isChat.length > 0) {
//     res.send(isChat[0]);
//   } else {
//     var chatData = {
//       chatname: "sender",
//       isGroupCaht: false,
//       users: [req.user._id, userId],
//     };
//   }

//   try {
//     const createChat = await Chat.create(chatData);
//     const chat = await Chat.findById(createChat._id).populate(
//       "users",
//       "-password"
//     );
//     return res.status(201).json({ message: "createChat successfully", chat });
//   } catch (error) {
//     console.log("error ", error);
//     return res.status(400).json({ message: "Error in create Chat" });
//   }
// };

// const fetchChats = async (req, res) => {
//   try {
//     const chat = await Chat.findById({
//       users: { $elemMatch: { $eq: req.user._id } },
//     })
//       .populate("users", "-password")
//       .populate("groupAdmin", "-password")
//       .populate("latestMessage")
//       .sort({ updatedAt: -1 });

//     chat = await User.populate(chat, {
//       path: "latestMessage",
//       select: "username image email",
//     });
//     return res
//       .status(201)
//       .json({ message: "Fetching Chats Successfully", chat });
//   } catch (error) {
//     console.log("error ", error);
//     return res.status(400).json({ message: "Error in Fetching Chats" });
//   }
// };

// const createGroup = async (req, res) => {
//   if (!req.body.user || req.body.username) {
//     return res.status(400).json({ message: "All fields are required" });
//   }
//   var users = JSON.parse(req.body.user);
//   if (users.length < 2) {
//     return res
//       .status(400)
//       .json({ message: "A group must have more than 2 users" });
//   }
//   users.push(req.user);
//   try {
//     const groupChat = await Chat.create({
//       chatname: req.body.username,
//       users: users,
//       isGroupCaht: true,
//       groupAdmin: req.user,
//     });
//     const fetchGroupChat = await Chat.findOne({ _id: groupChat._id })
//       .populate("users", "-password")
//       .populate("groupAdmin", "-password");
//     return res
//       .status(201)
//       .json({ message: "Successfully get Group Chats", fetchGroupChat });
//   } catch (error) {
//     console.log("error", error);
//     return res.status(400).json({ message: "Error in create Group" });
//   }
// };

// const renameGroup = async (req, res) => {
//   try {
//     const { chatId, chatname } = req.body;
//     if (!chatname) {
//       return res
//         .status(400)
//         .json({ message: "Please Provide a Valid Chat name" });
//     }
//     const updateName = await Chat.findByIdAndUpdate(
//       chatId,
//       {
//         chatname: chatname,
//       },
//       {
//         new: true,
//       }
//     )
//       .populate("users", "-password")
//       .populate("groupAdmin", "-password");
//     return res
//       .status(201)
//       .json({ message: "Successfully Updated Group Name", updateName });
//   } catch (error) {
//     console.log("error", error);
//     return res.status(400).json({ message: "Error in Rename Group" });
//   }
// };

// const addToGroup = async (req, res) => {
//   const { chatId, userId } = req.body;
//   try {
//     const updatedChat = await Chat.findByIdAndUpdate(
//       chatId,
//       {
//         $push: { users: userId },
//       },
//       {
//         new: true,
//       }
//     )
//       .populate("users", "-password")
//       .populate("groupAdmin", "-password");
//     if (!updatedChat) {
//       res.status(400).json({ message: "Invalid chat" });
//     } else {
//       res
//         .status(200)
//         .json({ message: "User Successfully Add to Group", updatedChat });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Error in Add to Group" });
//   }
// };

// const removeToGroup = async (req, res) => {
//   const { chatId, userId } = req.body;
//   try {
//     const updatedChat = await Chat.findByIdAndUpdate(
//       chatId,
//       {
//         $pull: { users: userId },
//       },
//       {
//         new: true,
//       }
//     )
//       .populate("users", "-password")
//       .populate("groupAdmin", "-password");
//     if (!updatedChat) {
//       res.status(400).json({ message: "Invalid chat" });
//     } else {
//       res
//         .status(200)
//         .json({ message: "User Successfully Add to Group", updatedChat });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Error in Add to Group" });
//   }
// };

// export {
//   accessChat,
//   fetchChats,
//   createGroup,
//   renameGroup,
//   addToGroup,
//   removeToGroup,
// };
