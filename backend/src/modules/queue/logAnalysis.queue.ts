import { Queue } from "bullmq";
import { createRedisConnection } from "../../utils/redisConnection.js";

export const connection = createRedisConnection();

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
