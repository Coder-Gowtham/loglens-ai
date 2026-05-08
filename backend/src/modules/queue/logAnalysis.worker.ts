import { Job, Worker } from "bullmq";
import prisma from "../../config/db.js";
import redis from "../../config/redis.js";
import { cacheKeys } from "../../utils/cacheKeys.js";

type LogAnalysisJobData = {
  logId: string;
};

type LogAnalysisResult = {
  success: boolean;
  logId: string;
  processedAt: string;
};

const connection = {
  host: "127.0.0.1",
  port: 6379,
};

async function processLogAnalysisJob(
  job: Job<LogAnalysisJobData>
): Promise<LogAnalysisResult> {
  const { logId } = job.data;

  console.log(`[Worker] Processing log analysis job ${job.id}`);
  console.log(`[Worker] Log ID: ${logId}`);

  if (!logId) {
    throw new Error("logId is required");
  }

  const log = await prisma.log.findUnique({
    where: { id: logId },
  });

  if (!log) {
    throw new Error(`Log not found: ${logId}`);
  }

  await prisma.log.update({
    where: { id: logId },
    data: {
      status: "processing",
    },
  });

  // Fake analysis for now. AI will come later.
  await new Promise((resolve) => setTimeout(resolve, 2000));

  await prisma.log.update({
    where: { id: logId },
    data: {
      status: "completed",
    },
  });

  await redis.del(cacheKeys.logsAll);

  console.log(`[Worker] Completed log analysis for ${logId}`);

  return {
    success: true,
    logId,
    processedAt: new Date().toISOString(),
  };
}

export const logAnalysisWorker = new Worker<LogAnalysisJobData>(
  "log-analysis",
  processLogAnalysisJob,
  {
    connection,
    concurrency: 2,
  }
);

logAnalysisWorker.on("ready", () => {
  console.log("[Worker] Log analysis worker is ready");
});

logAnalysisWorker.on("completed", (job, result) => {
  console.log(`[Worker] Job completed: ${job.id}`);
  console.log("[Worker] Result:", result);
});

logAnalysisWorker.on("failed", async (job, err) => {
  console.error(`[Worker] Job failed: ${job?.id}`);
  console.error("[Worker] Error:", err.message);

  const logId = job?.data?.logId;

  if (logId) {
    await prisma.log.update({
      where: { id: logId },
      data: {
        status: "failed",
      },
    });

    await redis.del(cacheKeys.logsAll);
  }
});

logAnalysisWorker.on("error", (err) => {
  console.error("[Worker] Worker error:", err);
});