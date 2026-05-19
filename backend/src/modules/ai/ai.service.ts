import { z } from "zod";
import { openai } from "../../config/openai.js";
import { buildLogAnalysisPrompt } from "./ai.prompts.js";
import { LogAnalysisResult } from "./ai.types.js";

const logAnalysisSchema = z.object({
  severity: z
    .string()
    .transform((value) => value.trim().toLowerCase())
    .pipe(z.enum(["low", "medium", "high"])),
  category: z.string().min(1, "Category is required"),
  summary: z.string().min(1, "Summary is required"),
  possibleCause: z.string().min(1, "Possible cause is required"),
  suggestedFix: z.string().min(1, "Suggested fix is required"),
  confidenceScore: z.coerce
    .number()
    .min(0, "Confidence score must be between 0 and 1")
    .max(1, "Confidence score must be between 0 and 1"),
});

function extractResponseText(response: any): string {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  if (Array.isArray(response.output)) {
    const fragments = response.output.flatMap((outputItem: any) => {
      if (!outputItem || !Array.isArray(outputItem.content)) {
        return [];
      }

      return outputItem.content
        .map((contentItem: any) => {
          if (typeof contentItem === "string") {
            return contentItem;
          }

          if (typeof contentItem?.text === "string") {
            return contentItem.text;
          }

          return "";
        })
        .filter(Boolean);
    });

    const joined = fragments.join("\n").trim();
    if (joined) {
      return joined;
    }
  }

  return "";
}

function parseAiJson(text: string) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Failed to parse AI response as JSON");
    }

    return JSON.parse(match[0]);
  }
}

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
              enum: ["low", "medium", "high"],
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

  const outputText = extractResponseText(response);

  if (!outputText) {
    throw new Error("No AI response received");
  }

  const parsedResponse = parseAiJson(outputText);

  return logAnalysisSchema.parse(parsedResponse);
}