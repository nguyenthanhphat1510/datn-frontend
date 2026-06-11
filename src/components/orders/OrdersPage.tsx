"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { fmt } from "@/lib/format";
import { getOrders, type Order } from "@/services/orders";

/* Map trạng thái đơn → nhãn tiếng Việt + màu badge (khớp OrderStatus backend). */
const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Chờ xác nhận", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Đã xác nhận", cls: "bg-blue-100 text-blue-700" },
  shipping: { label: "Đang giao", cls: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "Đã giao", cls: "bg-emerald-100 text-[#007e42]" },
  cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-600" },
};

/* Các tab lọc trạng thái (kiểu Shopee). "all" = tất cả. */
const TABS: { key: string; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
  { key: "cancelled", label: "Đã hủy" },
];

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? {
    label: status,
    cls: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

/* ─────────────────────────────────────────
   Một card đơn hàng — luôn hiện sản phẩm (kiểu Shopee)
───────────────────────────────────────── */
function OrderCard({ order }: { order: Order }) {
  const createdAt = new Date(order.createdAt).toLocaleString("vi-VN");

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Header: mã đơn + ngày + trạng thái */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs font-semibold text-gray-700">
            Mã đơn: <span className="text-gray-500">#{order._id}</span>
          </span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Danh sách sản phẩm (luôn hiển thị) */}
      <div className="flex flex-col gap-3 px-5 py-4">
        {order.items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-emerald-50">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-gray-800">
                {item.name}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">x{item.quantity}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-gray-700">
              {fmt(item.subtotal)}
            </span>
          </div>
        ))}
      </div>

      {/* Ghi chú nếu có */}
      {order.note && (
        <p className="mx-5 mb-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <span className="font-semibold">Ghi chú:</span> {order.note}
        </p>
      )}

      {/* Footer: ngày + tổng tiền */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-5 py-3">
        <span className="text-xs text-gray-400">{createdAt}</span>
        <span className="text-sm text-gray-600">
          Thành tiền:{" "}
          <span className="text-base font-extrabold text-[#007e42]">
            {fmt(order.total)}
          </span>
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Trang "Đơn hàng của tôi"
───────────────────────────────────────── */
export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");

  /* ── Chặn chưa đăng nhập ── */
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/dang-nhap");
    }
  }, [authLoading, user, router]);

  /* ── Tải danh sách đơn ── */
  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    getOrders()
      .then((list) => {
        if (active) setOrders(list);
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error ? err.message : "Không tải được đơn hàng",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  /* ── Lọc theo tab ── */
  const filtered = useMemo(
    () => (tab === "all" ? orders : orders.filter((o) => o.status === tab)),
    [orders, tab],
  );

  /* ── Guard states ── */
  if (authLoading || (!user && !authLoading)) {
    return (
      <section className="min-h-screen bg-gray-50/60 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center text-sm text-gray-400">
          Đang tải...
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50/60 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-xl font-extrabold text-gray-800">
          Đơn hàng của tôi
        </h1>

        {/* Thanh tab lọc trạng thái (kiểu Shopee) */}
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
          {TABS.map((t) => {
            const count =
              t.key === "all"
                ? orders.length
                : orders.filter((o) => o.status === t.key).length;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-[#007e42] text-white shadow-sm"
                    : "text-gray-600 hover:bg-[#f1f7f3] hover:text-[#007e42]"
                }`}
              >
                {t.label}
                {count > 0 && (
                  <span
                    className={`ml-1.5 text-xs ${active ? "text-white/80" : "text-gray-400"}`}
                  >
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-400">Đang tải đơn hàng...</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-24 text-center">
            <h3 className="text-lg font-bold text-gray-700">
              {tab === "all"
                ? "Chưa có đơn hàng nào"
                : "Chưa có đơn nào ở mục này"}
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Hãy chọn sản phẩm và đặt hàng nhé!
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#007e42] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#007e42]/25 transition hover:bg-[#005f32]"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
