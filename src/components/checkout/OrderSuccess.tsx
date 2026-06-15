"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fmt } from "@/lib/format";
import type { Order } from "@/services/orders";
import { ORDER_SUCCESS_KEY } from "./CheckoutPage";

export default function OrderSuccess() {
  const [order, setOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);

  // Đọc Order vừa tạo từ sessionStorage (CheckoutPage ghi vào trước khi điều hướng).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(ORDER_SUCCESS_KEY);
      if (raw) {
        setOrder(JSON.parse(raw) as Order);
        sessionStorage.removeItem(ORDER_SUCCESS_KEY); // chỉ hiển thị 1 lần
      }
    } catch {
      /* không có/parse lỗi → dùng fallback bên dưới */
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <section className="min-h-screen bg-[#e5e7eb] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center text-sm text-gray-400">
          Đang tải...
        </div>
      </section>
    );
  }

  const addr = order?.shippingAddress;

  return (
    <section className="min-h-screen bg-[#e5e7eb] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-2xl">
        {/* Banner thành công */}
        <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#007e42"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <h1 className="mt-4 text-xl font-extrabold text-gray-800">
            Đặt hàng thành công!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Cảm ơn bạn đã mua hàng tại TP Agri. Đơn hàng đang chờ xác nhận.
          </p>
          {order && (
            <p className="mt-2 text-sm text-gray-600">
              Mã đơn:{" "}
              <span className="font-bold text-[#007e42]">#{order._id}</span>
            </p>
          )}
        </div>

        {/* Chi tiết đơn (nếu có dữ liệu) */}
        {order && (
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            {/* Địa chỉ giao */}
            {addr && (
              <div className="border-b border-gray-100 pb-4">
                <h2 className="mb-1 text-sm font-bold text-gray-800">
                  Giao đến
                </h2>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{addr.fullName}</span> ·{" "}
                  {addr.phone}
                </p>
                <p className="text-sm text-gray-600">{addr.address}</p>
              </div>
            )}

            {/* Danh sách item */}
            <div className="flex flex-col gap-3 border-b border-gray-100 py-4">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-emerald-50">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#007e42] px-1 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <p className="line-clamp-2 min-w-0 flex-1 text-xs font-medium text-gray-700">
                    {item.name}
                  </p>
                  <span className="shrink-0 text-sm font-semibold text-gray-800">
                    {fmt(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Tạm tính + phí ship + tổng */}
            <div className="flex flex-col gap-2 pt-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Tạm tính</span>
                <span>{fmt(order.total - order.shippingFee)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Phí vận chuyển</span>
                <span>
                  {order.shippingFee === 0 ? "Miễn phí" : fmt(order.shippingFee)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                <span className="text-sm font-bold text-gray-700">
                  Tổng cộng
                </span>
                <span className="text-lg font-extrabold text-[#007e42]">
                  {fmt(order.total)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nút điều hướng */}
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#007e42] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#007e42]/25 transition hover:bg-[#005f32]"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </section>
  );
}
