import mongoose ,{ Schema } from "mongoose";

const FriendSchema = Schema({
  userA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
},{timestamps:true});

// FriendSchema.index({ userA: 1, userB: 1 }, { unique: true });
export const AcceptFriends = mongoose.model('AcceptFriends', FriendSchema);
