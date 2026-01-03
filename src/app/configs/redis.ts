import { createClient } from "redis";
import { CustomError } from "../utils/error";
import { envSecrets } from "./env";


export const redisClient = createClient({
  username: envSecrets.REDIS_USERNAME,
  password: envSecrets.REDIS_PASSWORD,
  socket: {
    host: envSecrets.REDIS_HOST,
    port: envSecrets.REDIS_PORT,
  },
});

redisClient.on("error", (err) => {
  const error = CustomError.throwError({
    status: err.status || 500,
    message: "Redis connection error",
    errors: [err.message],
    hints:
      "Please check your Redis server configuration and ensure it is running.",
  });
  throw error;
});

export const connectRedis = async () => {
  if (!redisClient.isReady) {
    console.log("Redis is not connected");
    await redisClient.connect();
    console.log("Connected to Redis successfully");
  } else {
    console.log("Redis is already connected");
  }
};
