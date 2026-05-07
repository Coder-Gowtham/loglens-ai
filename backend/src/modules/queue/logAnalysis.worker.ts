import { Job, Worker } from "bullmq";

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

  console.log(`[Worker] Processing job ${job.id}`);
  console.log(`[Worker] Job name: ${job.name}`);
  console.log(`[Worker] Log ID: ${logId}`);

  if (!logId) {
    throw new Error("logId is required");
  }

  // Fake processing for now
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log(`[Worker] Finished job ${job.id}`);

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

logAnalysisWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job failed: ${job?.id}`);
  console.error("[Worker] Error:", err.message);
});

logAnalysisWorker.on("error", (err) => {
  console.error("[Worker] Worker error:", err);
});