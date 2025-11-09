import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema({
    // chatname:{
    //     type:String,
    //     required:[true,"chatname is required"]
    // },
    isGroupChat:{
        type:Boolean,
        default:false
    },
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    latestMessage:{
        type:String
        // type:mongoose.Schema.Types.ObjectId,
        // ref:"Message"
    },
    readMessage:{
        type:Boolean,
        default:false
    }
    // groupAdmin:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"User"
    // },
},{timestamps:true})

export const Chat = mongoose.model("Chat",chatSchema)
























































// const mongoose = require("mongoose");

// const chatSchema = new mongoose.Schema(
//   {
//     chatName: {
//       type: String,
//       required: [true, "chatName is required field"],
//       maxlength: 200,
//       trim: true,
//     },
//     isGroupChat: {
//       type: Boolean,
//       default: false,
//     },
//     users: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//     ],
//     latestMessage: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Message",
//     },
//     groupAdmin: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Chat = mongoose.model("Chat", chatSchema);
// module.exports = Chat;