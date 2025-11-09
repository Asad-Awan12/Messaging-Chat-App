import mongoose, { Schema } from "mongoose";

const FriendSchema = new Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
},{timestamps:true});

export const Friends = mongoose.model("Friends", FriendSchema);
