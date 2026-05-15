import { Job, Worker } from "bullmq";
import {Redis} from "ioredis";
import prisma from "../../config/db.js";
import { redis } from "../../config/redis.js";
import { cacheKeys } from "../../utils/cacheKeys.js";
import * as logService from "../logs/logs.service.js";
import { analyzeLogMessage } from "../ai/ai.service.js";

type LogAnalysisJobData = {
  logId: string;
};

type LogAnalysisResult = {
  success: boolean;
  logId: string;
  processedAt: string;
};

const connection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  })
  : new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
  });

async function processLogAnalysisJob(
  job: Job<LogAnalysisJobData>
): Promise<LogAnalysisResult> {
  const { logId } = job.data;

  console.log(`[Worker] Processing log analysis job ${job.id}`);
  console.log(`[Worker] Log ID: ${logId}`);

  if (!logId) {
    throw new Error("logId is required");
  }

  const log = await logService.getLogById(logId);

  if (!log) {
    throw new Error(`Log not found: ${logId}`);
  }

  await logService.markLogProcessing(logId);

  //Real AI analysis.
  const analysis = await analyzeLogMessage(log.message);

  await logService.saveLogAnalysis({
    logId,
    severity: analysis.severity,
    category: analysis.category,
    summary: analysis.summary,
    possibleCause: analysis.possibleCause,
    suggestedFix: analysis.suggestedFix,
    confidenceScore: analysis.confidenceScore,
  });

  console.log("[Worker] AI analysis result:", analysis);

  await logService.markLogCompleted(logId);

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
    await logService.markLogFailed(logId, err.message);
    await redis.del(cacheKeys.logsAll);
  }
});

logAnalysisWorker.on("error", (err) => {
  console.error("[Worker] Worker error:", err);
});