import { Redis, RedisOptions } from "ioredis";

function shouldUseTls(redisUrl?: string): boolean {
  if (!redisUrl) return false;
  return redisUrl.startsWith("rediss://");
}

export function createRedisConnection(
  overrides: RedisOptions = {}
): Redis {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    const options: RedisOptions = {
      maxRetriesPerRequest: null,
      ...overrides,
    };

    if (shouldUseTls(redisUrl)) {
      options.tls = {};
    }

    return new Redis(redisUrl, options);
  }

  return new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
    ...overrides,
  });
}
