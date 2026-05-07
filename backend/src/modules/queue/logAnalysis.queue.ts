import { Queue } from "bullmq";

export const logAnalysisQueue = new Queue("log-analysis", {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
});

export async function addLogAnalysisJob(logId: string) {
  return logAnalysisQueue.add("analyze-log", {
    logId,
  });
}