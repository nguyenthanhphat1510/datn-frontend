export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

type QueryValue = string | number | boolean | undefined | null;

function buildQuery(params?: Record<string, QueryValue>) {
  if (!params) return "";
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    usp.append(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
}

/** Đọc JWT từ localStorage (key trùng với AuthContext) để gắn vào header. */
function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Trích thông điệp lỗi từ response body (NestJS trả { message }). */
async function parseError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null);
  if (!data) return fallback;
  if (Array.isArray(data.message)) return data.message.join(", ");
  return data.message || fallback;
}

interface RequestOptions {
  auth?: boolean; // true → đính kèm Bearer token
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, QueryValue>,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}${buildQuery(params)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.auth ? authHeaders() : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res, `GET ${path} thất bại`));
  }
  return (await res.json()) as T;
}

async function mutate<T>(
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(options.auth ? authHeaders() : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res, `${method} ${path} thất bại`));
  }
  return (await res.json()) as T;
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return mutate<T>("POST", path, body, options);
}

export function apiPatch<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return mutate<T>("PATCH", path, body, options);
}

export function apiDelete<T>(
  path: string,
  options?: RequestOptions,
): Promise<T> {
  return mutate<T>("DELETE", path, undefined, options);
}

/**
 * Upload file (multipart/form-data). KHÔNG set Content-Type thủ công —
 * trình duyệt tự thêm boundary. Dùng cho upload ảnh sản phẩm/đánh giá.
 */
export async function apiUpload<T>(
  path: string,
  formData: FormData,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...(options.auth ? authHeaders() : {}),
    },
    body: formData,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res, `POST ${path} thất bại`));
  }
  return (await res.json()) as T;
}
