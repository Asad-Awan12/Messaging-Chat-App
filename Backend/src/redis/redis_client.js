import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
const redis = new Redis({
  host: process.env.REDIS_IP,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 2,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
});

redis.on("connect", () => {
  console.log("🔌 Redis TCP connected");
});

redis.on("ready", () => {
  console.log("✅ Redis client is ready to accept commands");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

redis.on("end", () => {
  console.log("🔴 Redis connection closed");
});

redis.on("reconnecting", () => {
  console.log("♻️ Redis reconnecting...");
});

const gracefulShutdown = () => {
  redis.quit((err, res) => {
    if (err) {
    } else {
    }
    process.exit();
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("SIGUSR2", gracefulShutdown);

export default redis;
