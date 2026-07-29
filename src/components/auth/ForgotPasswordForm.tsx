"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiPost } from "@/lib/api";
import Field, { IconMail } from "./Field";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiPost<{ message: string }>("/auth/forgot-password", {
        email,
      });
      // Backend luôn trả message chung, không tiết lộ email có tồn tại hay không.
      setSentMessage(res.message);
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
            Quên mật khẩu
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.
          </p>
        </div>

        {sentMessage ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-xs font-medium text-green-700">
              {sentMessage}
            </div>
            <p className="text-center text-xs text-gray-500">
              Không thấy email? Kiểm tra thư mục spam, hoặc{" "}
              <button
                type="button"
                onClick={() => setSentMessage(null)}
                className="font-semibold text-[#007e42] hover:underline"
              >
                gửi lại
              </button>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
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

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {error}
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
              Gửi link đặt lại mật khẩu
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-xs text-gray-600">
          Nhớ mật khẩu rồi?{" "}
          <Link href="/dang-nhap" className="font-semibold text-[#007e42] hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
