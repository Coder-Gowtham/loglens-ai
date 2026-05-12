import "dotenv/config";
import { analyzeLogMessage } from "./modules/ai/ai.service.js";

async function main() {
  const result = await analyzeLogMessage(
    "TypeError: Cannot read properties of undefined reading 'name' at UserService.ts:42"
  );

  console.log("AI structured result:");
  console.log(result);
}

main().catch((error) => {
  console.error("AI analysis test failed:", error);
});