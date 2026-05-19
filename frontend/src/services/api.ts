const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("unauthorized"));
    }

    const message =
      typeof data.message === "string"
        ? data.message
        : "Request failed";

    throw new ApiRequestError(response.status, message);
  }

  return data as T;
}

export { API_URL };
