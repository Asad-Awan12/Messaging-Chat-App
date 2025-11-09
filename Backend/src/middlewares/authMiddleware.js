import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export const authMiddleware = async (req, res, next) => {
const token =
    req.headers.authorization || req.headers?.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Required authorization token" });
  }

  const verifiedUser =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
  if (!verifiedUser) {
    return res
      .status(401)
      .json({ error: "Authorization failed, invalid or expire token" });
  }

  req.user = verifiedUser;
  console.log("vvvvv ",verifiedUser);
  
  console.log("userrsss", req.user);

  next();
};


export const adminAuthorizationToken = async(req,res,next)=>{
  const token = req.headers.authorization || req.headers.authorization.split(" ")[1]
  if (!token) {
    throw Error("Authorization Token is required")
  }
  const verifyAdmin = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  if (!verifyAdmin) {
    throw Error("Authorization Failed, Expire or Invalid Token")
  }
  if (verifyAdmin.status !== "admin") {
    throw Error("Invalid Token")
  }
  req.user = verifyAdmin;
  next()
}

/**
 * Socket.IO middleware for JWT authentication.
 */
export const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
     console.log(`TOKEN:${token}`)

    if (!token) {
      console.warn("❌ Missing socket token");
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.user = decoded;

    console.log("🟢 Socket authenticated:", decoded.id);
    next();
  } catch (error) {
    console.error("❌ Socket auth failed:", error.message);
    next(new Error("Authentication error"));
  }
};
