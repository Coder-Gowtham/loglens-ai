import { Queue } from "bullmq";

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
};

export const logAnalysisQueue = new Queue("log-analysis", {
  connection,
});

export async function addLogAnalysisJob(logId: string) {
  return logAnalysisQueue.add(
    "analyze-log",
    { logId },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
}