"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

function AuthCallbackInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sp.get("token");
    if (!token) {
      setError("Thiếu token. Vui lòng thử đăng nhập lại.");
      return;
    }
    loginWithToken(token)
      .then(() => router.replace("/"))
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "Đăng nhập thất bại";
        setError(msg);
      });
  }, [loginWithToken, router, sp]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-[#e8f5ec] via-[#f5fbf7] to-[#e0f0e6] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-black/5">
        {error ? (
          <>
            <h1 className="mb-2 text-lg font-bold text-red-600">
              Đăng nhập thất bại
            </h1>
            <p className="mb-5 text-sm text-gray-600">{error}</p>
            <Link
              href="/dang-nhap"
              className="inline-flex items-center justify-center rounded-full bg-[#007e42] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#006836]"
            >
              Quay lại trang đăng nhập
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#007e42]/20 border-t-[#007e42]" />
            <h1 className="text-base font-semibold text-[#007e42]">
              Đang đăng nhập với Google...
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Vui lòng chờ trong giây lát.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#007e42]/20 border-t-[#007e42]" />
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
