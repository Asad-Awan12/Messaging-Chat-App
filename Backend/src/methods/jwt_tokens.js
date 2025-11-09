import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export const generateAccessToken = (user)=>{
    if(!user) return
   return jwt.sign({
        id: user._id,
        username:user.username,
        email:user.email,
        status:user.status
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
)
}

export const generateRefreshToken = (user)=>{
    if(!user) return 
   return jwt.sign({
        id: user._id,
        username:user.username,
        email:user.email,
        status:user.status
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
)
}
