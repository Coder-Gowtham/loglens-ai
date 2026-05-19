import { createRedisConnection } from "../utils/redisConnection.js";

export const redis = createRedisConnection();

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (error) => {
  console.error("Redis error:", error);
});
