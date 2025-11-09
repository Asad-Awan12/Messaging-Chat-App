import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        trim:true
    },
    chatId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Chat"
    },
    readBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Message = mongoose.model("Message",messageSchema)