export type LogSeverity = "low" | "medium" | "high";

export type LogAnalysisResult = {
  severity: LogSeverity;
  category: string;
  summary: string;
  possibleCause: string;
  suggestedFix: string;
  confidenceScore: number;
};