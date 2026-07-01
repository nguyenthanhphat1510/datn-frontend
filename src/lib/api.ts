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

/** Thông báo hiển thị cho người dùng khi phiên đăng nhập hết hạn. */
export const SESSION_EXPIRED_MESSAGE =
  "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";

/**
 * Dọn phiên hết hạn và đưa người dùng về trang đăng nhập.
 * Gọi khi API trả 401 với request có kèm token (token hết hạn/không hợp lệ).
 * Chỉ chạy phía client; kèm ?next= để quay lại trang cũ sau khi đăng nhập.
 */
function handleUnauthorized() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  const { pathname, search } = window.location;
  // Tránh vòng lặp nếu đang ở sẵn trang đăng nhập.
  if (pathname.startsWith("/dang-nhap")) return;
  const next = encodeURIComponent(pathname + search);
  window.location.href = `/dang-nhap?next=${next}`;
}

/** Trích thông điệp lỗi từ response body (NestJS trả { message }). */
async function parseError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null);
  if (!data) return fallback;
  if (Array.isArray(data.message)) return data.message.join(", ");
  return data.message || fallback;
}

/**
 * Ném lỗi từ response lỗi. Nếu là 401 trên request có kèm token,
 * coi như phiên hết hạn: dọn phiên + điều hướng về đăng nhập, và ném
 * thông báo thân thiện thay cho "Unauthorized" thô từ backend.
 */
async function throwResponseError(
  res: Response,
  fallback: string,
  authed: boolean,
): Promise<never> {
  if (res.status === 401 && authed) {
    handleUnauthorized();
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }
  throw new Error(await parseError(res, fallback));
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
    await throwResponseError(res, `GET ${path} thất bại`, !!options.auth);
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
    await throwResponseError(res, `${method} ${path} thất bại`, !!options.auth);
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
    await throwResponseError(res, `POST ${path} thất bại`, !!options.auth);
  }
  return (await res.json()) as T;
}
