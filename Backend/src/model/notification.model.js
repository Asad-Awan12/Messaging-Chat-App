import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    notificationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message",
        required:true
    }
},{timestamps:true})

export const Notification = mongoose.model("Notification",notificationSchema)