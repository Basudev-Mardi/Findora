function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Resolves the backend API base URL at runtime:
 * - Server runtime (Next.js functions on Vercel): prefers the injected
 *   `BACKEND_URL` service binding, falling back to `NEXT_PUBLIC_API_URL`
 *   or local dev Express URL.
 * - Browser runtime: uses `NEXT_PUBLIC_API_URL` if explicitly configured
 *   (e.g., standalone local dev), otherwise uses same-origin `/api` which
 *   Vercel rewrites to the `backend` service.
 */
export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    const boundBackendUrl = process.env.BACKEND_URL?.trim();
    if (boundBackendUrl) {
      return `${stripTrailingSlash(boundBackendUrl)}/api`;
    }

    const publicUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (publicUrl && publicUrl.startsWith("http")) {
      return stripTrailingSlash(publicUrl);
    }

    return "http://localhost:5000/api";
  }

  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (publicUrl) {
    return stripTrailingSlash(publicUrl);
  }

  return "/api";
}

export const env = {
  get apiUrl(): string {
    return getApiBaseUrl();
  },
} as const;
