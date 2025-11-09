import { Chat } from "../model/chat.model.js";
import { Message } from "../model/message.model.js";
import { User } from "../model/user.model.js";

const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;
  if (!chatId || !content) {
    return res.status(400).json({ message: "All fields are required" });
  }
  var message = {
    sender: req.user._id,
    chat: chatId,
    content: content,
  };
  try {
    let create_message = (
      await (await Message.create(message)).populate("sender", "image username")
    ).populate("chat");
    create_message = await User.populate(create_message, {
      path: "chat.users",
      select: "username email image",
    });
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: create_message,
    });
    if (!create_message) {
      return res.status(400).json({ message: "Error in create Messages" });
    }
    return res
      .status(201)
      .json({ message: "Successfully Send Message", create_message });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({ message: "Error in Sending Messages" });
  }
};

const fetchMessage = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  try {
    const chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [currentUserId, userId] },
    });

    if (!chat) {
      return res.status(404).json({ message: "No chat found between users" });
    }

    const allMessages = await Message.find({ chatId: chat._id })
      .populate("senderId", "username profile")
      .populate("chatId");

    return res
      .status(200)
      .json({ message: "Successfully get all messages", allMessages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server could not process request" });
  }
};

const getAllMessages = async (req, res) => {
  try {
    const allMessages = await Message.find({});
    return res.status(200).json(allMessages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLatestMessage = async (req, res) => {
  try {
    const {userId} = req.params;

    const chats = await Chat.find({ users: userId }).lean();

   const chatWithLatest = await Promise.all(
      chats.map(async (chat) => {
        const latestMsg = await Message.findOne({ chatId: chat._id })
          .sort({ createdAt: -1 }) // latest first
          .limit(1)
          .lean();

        return {
          ...chat,
          latestMessage: latestMsg || null,
        };
      })
    );

    res.status(200).json(chatWithLatest);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { fetchMessage, sendMessage, getAllMessages, getLatestMessage };
