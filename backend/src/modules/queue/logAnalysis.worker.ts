import { Job, Worker } from "bullmq";
import * as logService from "../logs/logs.service.js";
import { analyzeLogMessage } from "../ai/ai.service.js";
import { createRedisConnection } from "../../utils/redisConnection.js";
import { clearLogsCache } from "../../utils/clearLogsCache.js";

type LogAnalysisJobData = {
  logId: string;
};

type LogAnalysisResult = {
  success: boolean;
  logId: string;
  processedAt: string;
};

const connection = createRedisConnection();

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

  await logService.markLogCompleted(logId);
  await clearLogsCache();

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
    await clearLogsCache();
  }
});

logAnalysisWorker.on("error", (err) => {
  console.error("[Worker] Worker error:", err);
});
