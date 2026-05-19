import { redis } from "../config/redis.js";

export async function clearLogsCache(): Promise<void> {
  const keys = await redis.keys("logs:*");

  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
