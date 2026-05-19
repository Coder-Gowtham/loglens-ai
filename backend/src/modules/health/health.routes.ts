import { Router } from "express";
import prisma from "../../config/db.js";
import { redis } from "../../config/redis.js";

const router = Router();

router.get("/", async (_req, res) => {
  const checks: Record<string, string> = {
    api: "ok",
    database: "unknown",
    redis: "unknown",
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  try {
    const pong = await redis.ping();
    checks.redis = pong === "PONG" ? "ok" : "error";
  } catch {
    checks.redis = "error";
  }

  const healthy =
    checks.database === "ok" && checks.redis === "ok";

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    service: "LogLens AI Backend",
    checks,
    timestamp: new Date().toISOString(),
  });
});

export default router;
