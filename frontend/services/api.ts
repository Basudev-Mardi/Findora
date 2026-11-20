import { env } from "@/config/env";
import type { ApiResponse, HealthStatus } from "@/types/api";

export class ApiClientError extends Error {
  status: number;
  details: Record<string, string> | null;

  constructor(
    message: string,
    status = 500,
    details: Record<string, string> | null = null
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${env.apiUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const { headers: customHeaders, ...restOptions } = options ?? {};

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      ...restOptions,
      headers: {
        "Content-Type": "application/json",
        ...(customHeaders ?? {}),
      },
    });
  } catch {
    throw new ApiClientError(
      "Unable to reach the Findora API server. Make sure the backend is running.",
      0
    );
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    throw new ApiClientError(
      payload?.message || `API request failed (HTTP ${response.status})`,
      response.status,
      payload?.details ?? null
    );
  }

  return payload;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),
  patch: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
  health: () => request<HealthStatus>("/health", { method: "GET" }),
};
