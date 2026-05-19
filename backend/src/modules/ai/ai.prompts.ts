export function buildLogAnalysisPrompt(logMessage: string) {
  return `
You are a senior backend engineer analyzing application logs.

Analyze this log message:
${logMessage}

Return only valid JSON with:
- severity: one of low, medium, high
- category: short technical category
- summary: short explanation
- possibleCause: likely root cause
- suggestedFix: practical fix suggestion
- confidenceScore: number between 0 and 1

Do not include anything outside the JSON object.
`;
}