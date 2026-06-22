"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import type { PaymentReturnResult } from "@/services/orders";

type Phase = "verifying" | "success" | "failed";

interface PaymentReturnProps {
  /** Hàm verify tương ứng cổng thanh toán (VNPay/MoMo). Nhận query string. */
  verify: (search: string) => Promise<PaymentReturnResult>;
}

/**
 * Trang dùng chung cho cổng thanh toán redirect khách về sau khi trả tiền.
 * Đọc query params trên URL, gửi backend verify chữ ký, rồi:
 *  - Thành công → điều hướng sang trang đặt hàng thành công.
 *  - Thất bại → hiển thị thông báo lỗi + lối quay lại.
 */
export default function PaymentReturn({ verify }: PaymentReturnProps) {
  const router = useRouter();
  const { refresh } = useCart();
  const [phase, setPhase] = useState<Phase>("verifying");
  const [message, setMessage] = useState("");
  const ran = useRef(false); // chống chạy 2 lần do React StrictMode

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const res = await verify(window.location.search);
        if (res.success) {
          setPhase("success");
          setMessage(res.message);
          // Đồng bộ giỏ (đã clear khi tạo đơn) rồi sang trang thành công.
          try {
            await refresh();
          } catch {
            /* không chặn điều hướng nếu refresh lỗi */
          }
          router.replace("/dat-hang-thanh-cong");
        } else {
          setPhase("failed");
          setMessage(res.message || "Thanh toán không thành công");
        }
      } catch (err) {
        setPhase("failed");
        setMessage(
          err instanceof Error ? err.message : "Xác nhận thanh toán thất bại",
        );
      }
    })();
  }, [router, refresh, verify]);

  return (
    <section className="min-h-screen bg-[#e5e7eb] px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-md">
        {phase === "verifying" && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#007e42]" />
            <h1 className="text-lg font-bold text-gray-800">
              Đang xác nhận thanh toán...
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Vui lòng không đóng trang này.
            </p>
          </>
        )}

        {phase === "success" && (
          <>
            <h1 className="text-lg font-bold text-[#007e42]">
              Thanh toán thành công
            </h1>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
            <p className="mt-1 text-sm text-gray-400">Đang chuyển hướng...</p>
          </>
        )}

        {phase === "failed" && (
          <>
            <h1 className="text-lg font-bold text-red-600">
              Thanh toán không thành công
            </h1>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/don-hang"
                className="rounded-xl bg-[#007e42] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#006a38]"
              >
                Xem đơn hàng của tôi
              </Link>
              <Link
                href="/gio-hang"
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#007e42]/40"
              >
                Quay lại giỏ hàng
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
