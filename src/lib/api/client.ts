/**
 * Thin, typed HTTP client for the TechWiki API. Single place that knows the
 * response envelope, auth header, and error shape — components never fetch
 * directly (separation of concerns).
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

interface RequestOptions extends RequestInit {
  token?: string | null;
  // Next.js fetch caching controls (used for ISR on the customer portal).
  next?: { revalidate?: number; tags?: string[] };
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  let body: Envelope<T>;
  try {
    body = (await res.json()) as Envelope<T>;
  } catch {
    throw new ApiError('Invalid server response', 'BAD_RESPONSE', res.status);
  }

  if (!res.ok || !body.success) {
    throw new ApiError(
      body.error?.message ?? 'Request failed',
      body.error?.code ?? 'UNKNOWN',
      res.status
    );
  }
  return body.data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, data?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body: JSON.stringify(data ?? {}) }),
  put: <T>(path: string, data?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body: JSON.stringify(data ?? {}) }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};

export { API_URL };
