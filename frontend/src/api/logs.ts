const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
console.log("PRODUCTION API URL:", API_URL);

export async function getLogs(
  page = 1,
  limit = 5,
  search = "",
  severity = "all"
) {
  const token = localStorage.getItem("token");

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    severity,
  });

  const response = await fetch(`${API_URL}/logs?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch logs");
  }

  return response.json();
}

export async function reanalyzeLog(logId: string) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/logs/${logId}/reanalyze`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to re-analyze log");
  }

  return response.json();
}