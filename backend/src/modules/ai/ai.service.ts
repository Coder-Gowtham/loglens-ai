import { openai } from "../../config/openai.js";
import { buildLogAnalysisPrompt } from "./ai.prompts.js";
import { LogAnalysisResult } from "./ai.types.js";

export async function analyzeLogMessage(
  logMessage: string
): Promise<LogAnalysisResult> {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: buildLogAnalysisPrompt(logMessage),
    text: {
      format: {
        type: "json_schema",
        name: "log_analysis",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            severity: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
            },
            category: {
              type: "string",
            },
            summary: {
              type: "string",
            },
            possibleCause: {
              type: "string",
            },
            suggestedFix: {
              type: "string",
            },
            confidenceScore: {
              type: "number",
              minimum: 0,
              maximum: 1,
            },
          },
          required: [
            "severity",
            "category",
            "summary",
            "possibleCause",
            "suggestedFix",
            "confidenceScore",
          ],
        },
      },
    },
  });

  const outputText = response.output_text;

  if (!outputText) {
    throw new Error("No AI response received");
  }

  return JSON.parse(outputText) as LogAnalysisResult;
}