export type LogSeverity = "low" | "medium" | "high" | "critical";

export type LogAnalysisResult = {
  severity: LogSeverity;
  category: string;
  summary: string;
  possibleCause: string;
  suggestedFix: string;
  confidenceScore: number;
};