import { apiRequest } from "../services/api";

export type LogAnalysis = {
  id: string;
  summary?: string;
  severity?: string;
  possibleCause?: string;
  suggestedFix?: string;
  category?: string;
  confidenceScore?: number;
  createdAt?: string;
};

export type Log = {
  id: string;
  level: string;
  message: string;
  source?: string;
  status: string;
  errorMessage?: string | null;
  createdAt: string;
  analysis?: LogAnalysis | null;
};

type LogsResponse = {
  data: Log[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type LogResponse = {
  data: Log;
};

export async function getLogs(
  page: number,
  limit: number,
  search: string,
  severity: string,
  projectId?: string
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    severity,
  });

  if (projectId) {
    params.set("projectId", projectId);
  }

  return apiRequest<LogsResponse>(`/logs?${params.toString()}`);
}

export async function createLog(payload: {
  projectId: string;
  level?: string;
  message: string;
  source?: string;
}) {
  return apiRequest<LogResponse>("/logs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function reanalyzeLog(logId: string) {
  return apiRequest<{ message: string }>(`/logs/${logId}/reanalyze`, {
    method: "POST",
  });
}
