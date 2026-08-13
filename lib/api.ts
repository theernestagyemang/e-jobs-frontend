import type { ApiError } from "@/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiFetchOptions {
  method?: HttpMethod;
  /** Serialized to JSON automatically. */
  body?: unknown;
  /** JWT — sent as `Authorization: Bearer {token}` when present. */
  token?: string;
  /** Extra headers, merged over the defaults. */
  headers?: Record<string, string>;
  /** Passed straight through to fetch (cache, next, signal, credentials, ...). */
  init?: Omit<RequestInit, "method" | "body" | "headers">;
}

/**
 * Error thrown for any non-2xx response. `message` is the backend's
 * ApiError.message; the parsed envelope is kept on `.details` when available.
 */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly details?: ApiError;

  constructor(message: string, status: number, details?: ApiError) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Typed wrapper around native fetch for the e-jobs backend.
 *
 * @param path route relative to NEXT_PUBLIC_API_URL, e.g. "/jobs" or "/auth/login"
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  const { method = "GET", body, token, headers, init } = options;

  const headerBag: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (token) {
    headerBag.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
    {
      ...init,
      method,
      headers: headerBag,
      body: body === undefined ? undefined : JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const details = await parseJson<ApiError>(response);
    throw new ApiRequestError(
      details?.message || response.statusText || `Request failed (${response.status})`,
      response.status,
      details ?? undefined,
    );
  }

  // 204 No Content and empty bodies resolve to undefined.
  const data = await parseJson<T>(response);
  return data as T;
}

async function parseJson<T>(response: Response): Promise<T | null> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
