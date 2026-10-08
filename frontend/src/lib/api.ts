export const API =
  import.meta.env.VITE_API_URL || "https://backenddasandco.vercel.app/api";

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data
        ? data.message || data.error
        : data;
    throw new Error(message || `Request failed (${response.status})`);
  }

  return data as T;
}
