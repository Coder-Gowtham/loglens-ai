import {redis} from "./config/redis.js";

async function testRedis() {
  await redis.set("test:key", "Hello Redis");

  const value = await redis.get("test:key");

  console.log("Redis value:", value);

  process.exit(0);
}

testRedis();