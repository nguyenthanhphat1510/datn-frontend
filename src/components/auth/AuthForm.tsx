"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/lib/api";

type Mode = "login" | "register";

function IconMail() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function IconEye({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A10.9 10.9 0 0 1 12 6c6.5 0 10 7 10 7a17.9 17.9 0 0 1-3.2 4.1" />
      <path d="M6.1 6.1C3.5 7.7 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.4 5-1.2" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function IconGoogle() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
      viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8a12 12 0 0 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44c11 0 20-9 20-20 0-1.2-.1-2.4-.4-3.5Z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7Z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28.5l-6.6 5.1A20 20 0 0 0 24 44Z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C42 35 44 30 44 24c0-1.2-.1-2.4-.4-3.5Z" />
    </svg>
  );
}

/** Chỉ cho phép redirect nội bộ (bắt đầu bằng "/" nhưng không phải "//") để tránh open-redirect. */
function safeNext(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();
  const next = safeNext(searchParams.get("next"));

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isLogin = mode === "login";

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setSuccess(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, fullName || undefined);
      }

      setSuccess(
        isLogin
          ? "Đăng nhập thành công! Đang chuyển trang..."
          : "Đăng ký thành công! Đang chuyển trang...",
      );
      setTimeout(() => router.push(next), 800);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    window.location.href = `${API_URL}/auth/google`;
  }

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-xl">
      {/* Tabs */}
      <div className="relative grid grid-cols-2 border-b-2 border-gray-200 bg-[#f1f7f3] text-sm font-semibold">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={`relative z-10 py-3.5 transition ${
            isLogin ? "text-[#007e42]" : "text-gray-500 hover:text-[#007e42]"
          }`}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => switchMode("register")}
          className={`relative z-10 py-3.5 transition ${
            !isLogin ? "text-[#007e42]" : "text-gray-500 hover:text-[#007e42]"
          }`}
        >
          Đăng ký
        </button>
        <span
          className="absolute bottom-0 h-0.5 w-1/2 bg-[#007e42] transition-transform duration-300"
          style={{ transform: isLogin ? "translateX(0)" : "translateX(100%)" }}
        />
      </div>

      <div className="px-7 py-7">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#007e42]/10 ring-1 ring-[#007e42]/20">
            <Image src="/caylua.jpg" alt="TP Agri" width={56} height={56} className="object-cover" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#007e42]">
            {isLogin ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            {isLogin
              ? "Đăng nhập để tiếp tục mua sắm tại TP Agri."
              : "Đăng ký tài khoản để nhận ưu đãi và theo dõi đơn hàng."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <Field
              label="Họ và tên"
              icon={<IconUser />}
              type="text"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={setFullName}
              autoComplete="name"
            />
          )}

          <Field
            label="Email"
            icon={<IconMail />}
            type="email"
            placeholder="ban@example.com"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />

          <Field
            label="Mật khẩu"
            icon={<IconLock />}
            type={showPassword ? "text" : "password"}
            placeholder="Tối thiểu 6 ký tự"
            value={password}
            onChange={setPassword}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            trailing={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="text-gray-400 transition hover:text-[#007e42]"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <IconEye open={showPassword} />
              </button>
            }
          />

          {!isLogin && (
            <Field
              label="Xác nhận mật khẩu"
              icon={<IconLock />}
              type={showPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              required
            />
          )}

          {isLogin && (
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-gray-300 text-[#007e42] focus:ring-[#007e42]"
                />
                Ghi nhớ đăng nhập
              </label>
              <Link href="/quen-mat-khau" className="font-semibold text-[#007e42] hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-[#007e42] py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#006836] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-gray-400">
          <span className="h-0.5 flex-1 bg-gray-300" />
          hoặc
          <span className="h-0.5 flex-1 bg-gray-300" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-[#007e42]/40 hover:bg-[#f1f7f3]"
        >
          <IconGoogle />
          Tiếp tục với Google
        </button>

        <p className="mt-5 text-center text-xs text-gray-600">
          {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <button
            type="button"
            onClick={() => switchMode(isLogin ? "register" : "login")}
            className="font-semibold text-[#007e42] hover:underline"
          >
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  trailing,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-gray-700">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-3 py-2.5 transition focus-within:border-[#007e42] focus-within:ring-2 focus-within:ring-[#007e42]/20">
        <span className="text-gray-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
        {trailing}
      </span>
    </label>
  );
}
