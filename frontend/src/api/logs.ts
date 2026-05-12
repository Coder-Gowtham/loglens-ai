const API_URL = "http://localhost:5000";

export async function getLogs() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/logs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch logs");
  }

  return response.json();
}