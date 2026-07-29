"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import Field, { IconEye, IconLock } from "./Field";

export default function ResetPasswordForm() {
  const router = useRouter();
  // Token đi từ email → thanh địa chỉ → gửi thẳng lên backend, không lưu lại.
  const token = useSearchParams().get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/auth/reset-password", { token, newPassword: password });
      setSuccess("Đặt lại mật khẩu thành công! Đang chuyển tới trang đăng nhập...");
      setTimeout(() => router.push("/dang-nhap"), 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-xl">
      <div className="px-7 py-8">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#007e42]/10 ring-1 ring-[#007e42]/20">
            <Image src="/caylua.jpg" alt="TP Agri" width={56} height={56} className="object-cover" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#007e42]">
            Đặt mật khẩu mới
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        {!token ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-xs font-medium text-red-700">
              Liên kết không hợp lệ — thiếu mã xác thực. Hãy mở đúng link trong
              email chúng tôi đã gửi.
            </div>
            <Link
              href="/quen-mat-khau"
              className="flex w-full items-center justify-center rounded-full bg-[#007e42] py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#006836]"
            >
              Yêu cầu link mới
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Field
              label="Mật khẩu mới"
              icon={<IconLock />}
              type={showPassword ? "text" : "password"}
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
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

            <Field
              label="Xác nhận mật khẩu"
              icon={<IconLock />}
              type={showPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              required
            />

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
              disabled={loading || !!success}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-[#007e42] py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#006836] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              Đặt lại mật khẩu
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-xs text-gray-600">
          <Link href="/dang-nhap" className="font-semibold text-[#007e42] hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
