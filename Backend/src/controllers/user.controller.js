
// SignUp

 // get data from req.body
  // check all fields required
  // check user alredy exist email/username
  // hashed password 
  // get local image path
  // upload image on cloudinary && get url from it
  // create user
  // generate tokens refresh/accesstoken
  // set or update refreshToken in db
  // send data in response

  // Login












import ms from "ms";
import { generateAccessToken, generateRefreshToken } from "../methods/jwt_tokens.js";
import { generateAccessAndRefereshTokens } from "../middlewares/generateTokens.js";
import { Chat } from "../model/chat.model.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import bcrypt from "bcryptjs";
import RefreshToken from "../model/refresh_token.js";


const createUser = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    // 1. Validate fields
    if ([email, username, password].some((field) => !field?.trim())) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check duplicates
    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
      return res.status(409).json({ message: "User with email or username already exists" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Upload profile image
    const imageLocalPath = req.file?.path;
    const profileImage = await uploadOnCloudinary(imageLocalPath);
    if (!profileImage?.url) {
      return res.status(500).json({ message: "Error uploading image" });
    }

    // 5. Save user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      profile: profileImage.url,
    });

    const { password: _, ...user } = newUser.toObject();

    // 6. Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const expiresAt = new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRY));
    const accessTokenExpiry = new Date(Date.now() + ms(process.env.ACCESS_TOKEN_EXPIRY));

    const dbRefreshToken = await RefreshToken.findOneAndUpdate(
      { userId: user._id },
      { expiresAt, token: refreshToken },
      { upsert: true, new: true }
    );

    if (!dbRefreshToken) {
      return res.status(500).json({ message: "Failed to save refresh token" });
    }

    // 7. Success
    return res.status(201).json({
      message: "User registered successfully",
      user,
      accessToken,
      refreshToken,
      accessTokenExpiry,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: error.message || "Error creating user" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email && !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    if (user.email !== email) {
      return res.status(400).json({ message: "Invalid Email" });
    }
    const isPasswordValid = await bcrypt.compare(password,user?.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid User Credentials" });
    }

     const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const expiresAt = new Date(
      Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRY)
    );
    const accessTokenExpiresAt = new Date(
      Date.now() + ms(process.env.ACCESS_TOKEN_EXPIRY)
    );

    const dbToken = await RefreshToken.findOneAndUpdate(
      { userId: user._id },
      { expiresAt, token: refreshToken },
      { upsert: true, new: true }
    );

    if (!dbToken) {
      return res
        .status(400)
        .json({ error: "Failed to login please try again " });
    }
 
    const loggedInUser = await User.findById(user._id).select(
      "-password"
    );
    if (!loggedInUser) {
      return res.status(400).json({ message: "User not Found" });
    }

    return res
      .status(201)
      .json({
        message: "User Login Successfully",
        user: loggedInUser,
        accessToken,
        refreshToken,
        accessTokenExpiresAt:accessTokenExpiresAt
      });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({ message: "Login User Failed" });
  }
};

// In user.controller.js

const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;

    if (senderId.toString() === receiverId) {
      return res
        .status(400)
        .json({ message: "You cannot send a request to yourself" });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      receiver.friendRequests.includes(senderId) ||
      sender.sentRequests.includes(receiverId)
    ) {
      return res.status(400).json({ message: "Request already sent" });
    }

    receiver.friendRequests.push(senderId);
    sender.sentRequests.push(receiverId);

    await sender.save();
    await receiver.save();

    // Send socket event to receiver
    const io = req.app.get("io");
    io.to(receiverId.toString()).emit("friend_request_received", {
      senderId,
      senderName: sender.username,
      senderImage: sender.image,
    });

    console.log("io ", io);

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error sending friend request" });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const senderId = req.params.id;

    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!user.friendRequests.includes(senderId)) {
      return res
        .status(400)
        .json({ message: "No friend request from this user" });
    }

    // Remove from requests
    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== senderId.toString()
    );
    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== userId.toString()
    );

    // Add to friends list
    user.friends.push(senderId);
    sender.friends.push(userId);

    await user.save();
    await sender.save();

       // Check or create chat room
       const io = req.app.get("io");
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [userId, senderId] },
    });

    if (!chat) {
      const chatData = {
        chatname: "sender",
        isGroupChat: false,
        users: [userId, senderId],
      };

      const createdChat = await Chat.create(chatData);
      chat = await Chat.findById(createdChat._id).populate("users", "-password");
    }

    // Emit socket event to both users
    io.to(senderId.toString()).emit("friendRequestAccepted", {
      message: "Friend request accepted",
      chat,
      user: {
        _id: user._id,
        username: user.username,
        image: user.image,
      },
    });

    io.to(userId.toString()).emit("friendRequestAccepted", {
      message: "Friend request accepted",
      chat,
      user: {
        _id: sender._id,
        username: sender.username,
        image: sender.image,
      },
    });

    return res.status(200).json({
      message: "Friend request accepted and chat created",
      chat,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error accepting friend request" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Updaing Username Failed" });
    }
    const localImagePath = req.file.path;
    if (!localImagePath) {
      return res.status(400).json({ message: "Image LocalPath is required" });
    }
    const image = await uploadOnCloudinary(localImagePath);
    if (!image.url) {
      return res.status(400).json({ message: "Error in Uploading Image" });
    }
    const user = await User.findById(req.user._id);
    user.username = username;
    user.image = image?.url;
    await user.save({ validateBeforeSave: false });
    return res
      .status(201)
      .json({ message: "Successfully Updating User", user });
  } catch (error) {
    console.log("error ", error);
    return res.status(400).json({ message: "Error in Update User" });
  }
};

const allUsers = async (req, res) => {
  try {

    const users = await User.find()
      .select("-password -refreshToken")
      .lean();
    return res
      .status(200)
      .json({ message: "Successfully get All users", users });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({ message: "Error in getting All users" });
  }
};

// get single user
const getSingleUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate([
        { path: "friends", select: "_id username image" },
        { path: "friendRequests", select: "_id username image" },
        { path: "sentRequests", select: "_id username image" },
      ])
      .select("-password -refreshToken")
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching single user:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching user" });
  }
};

export {
  createUser,
  loginUser,
  updateUser,
  allUsers,
  sendFriendRequest,
  acceptFriendRequest,
  getSingleUser,
};
