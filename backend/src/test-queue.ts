import "./modules/queue/logAnalysis.worker.js";
import { addLogAnalysisJob } from "./modules/queue/logAnalysis.queue.js";

async function main() {
  const job = await addLogAnalysisJob("test-log-id-123");

  console.log("[Test File] Job added:", job.id);
}

main().catch(console.error);