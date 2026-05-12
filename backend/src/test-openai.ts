import "dotenv/config";
import { openai } from "./config/openai.js";

async function main() {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input:
      "Explain this error in simple terms: TypeError: Cannot read properties of undefined reading 'name'",
  });

  console.log("AI response:");
  console.log(response.output_text);
}

main().catch((error) => {
  console.error("OpenAI test failed:", error);
});