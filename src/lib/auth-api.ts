import { API_URL } from "./api";
import type { AuthUser } from "@/types/user";

export interface AuthResponse {
  message: string;
  user: AuthUser;
  access_token: string;
}

async function parseError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null);
  if (!data) return fallback;
  if (Array.isArray(data.message)) return data.message.join(", ");
  return data.message || fallback;
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Đăng nhập thất bại"));
  }
  return res.json();
}

export async function apiRegister(
  email: string,
  password: string,
  fullName?: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Đăng ký thất bại"));
  }
  return res.json();
}

export async function apiGetProfile(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Không lấy được thông tin người dùng"));
  }
  return res.json();
}
