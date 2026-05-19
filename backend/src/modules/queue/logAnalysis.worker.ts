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

async function safeClearLogsCache() {
  try {
    await clearLogsCache();
  } catch (error) {
    console.error("[Worker] Failed to clear logs cache:", error);
  }
}

export async function processLogAnalysisById(
  logId: string
): Promise<LogAnalysisResult> {
  console.log(`[Worker] Processing log analysis`);
  console.log(`[Worker] Log ID: ${logId}`);

  if (!logId) {
    throw new Error("logId is required");
  }

  const log = await logService.getLogById(logId);

  if (!log) {
    throw new Error(`Log not found: ${logId}`);
  }

  try {
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
    await safeClearLogsCache();

    console.log(`[Worker] Completed log analysis for ${logId}`);

    return {
      success: true,
      logId,
      processedAt: new Date().toISOString(),
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown AI analysis error";

    await logService.markLogFailed(logId, message);
    await safeClearLogsCache();

    console.error(`[Worker] Failed log analysis for ${logId}:`, message);

    throw error;
  }
}

async function processLogAnalysisJob(
  job: Job<LogAnalysisJobData>
): Promise<LogAnalysisResult> {
  return processLogAnalysisById(job.data.logId);
}

const shouldStartWorker = process.env.USE_QUEUE === "true";

export let logAnalysisWorker: Worker<LogAnalysisJobData> | null = null;

if (shouldStartWorker) {
  const connection = createRedisConnection();

  logAnalysisWorker = new Worker<LogAnalysisJobData>(
    "log-analysis",
    processLogAnalysisJob,
    {
      connection,
      concurrency: 1,
      lockDuration: 30000,
      stalledInterval: 60000,
      maxStalledCount: 1,
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
      await safeClearLogsCache();
    }
  });

  logAnalysisWorker.on("error", (err) => {
    console.error("[Worker] Worker error:", err.message);

    if (
      err.message.includes("max requests limit exceeded") ||
      err.message.includes("ERR max requests limit exceeded")
    ) {
      console.error(
        "[Worker] Redis request limit exceeded. Disable queue with USE_QUEUE=false or upgrade Redis."
      );
    }
  });
} else {
  console.log("[Worker] Queue disabled. Worker not started.");
}