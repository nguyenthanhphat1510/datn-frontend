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
  confirmed: { label: "Đang xử lý", cls: "bg-blue-100 text-blue-700" },
  shipping: { label: "Đang giao", cls: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "Hoàn thành", cls: "bg-emerald-100 text-[#007e42]" },
  cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-600" },
};

/* Các bước tiến trình đơn (thanh stepper). */
const STEPS = ["Chờ xác nhận", "Đang xử lý", "Giao hàng", "Hoàn thành"];

/* Trạng thái backend → bước hiện tại (1-based). cancelled = 0 (ẩn stepper). */
function statusToStep(status: string): number {
  switch (status) {
    case "pending":
      return 1;
    case "confirmed":
      return 2;
    case "shipping":
      return 3;
    case "delivered":
      return 4;
    default:
      return 0; // cancelled / unknown
  }
}

/* Các tab lọc trạng thái (kiểu Shopee). "all" = tất cả. */
const TABS: { key: string; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đang xử lý" },
  { key: "shipping", label: "Đang giao" },
  { key: "delivered", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? {
    label: status,
    cls: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

/* ─────────────────────────────────────────
   Thanh tiến trình 4 bước (stepper)
───────────────────────────────────────── */
function OrderStepper({ status }: { status: string }) {
  const current = statusToStep(status);
  if (current === 0) return null;

  return (
    <div className="flex items-start">
      {STEPS.map((label, idx) => {
        const step = idx + 1;
        const done = step <= current;
        const lineDone = step < current;
        const isLast = step === STEPS.length;
        return (
          <div key={label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {/* chấm số */}
              <div className="flex flex-1 items-center">
                <div
                  className={`mx-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                    done
                      ? "bg-[#007e42] text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step}
                </div>
                {/* đường nối sang bước sau */}
                {!isLast && (
                  <div
                    className={`h-0.5 flex-1 ${
                      lineDone ? "bg-[#007e42]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            </div>
            <span
              className={`mt-2 text-center text-[11px] font-medium ${
                done ? "text-[#007e42]" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   Một card đơn hàng — chỉ tóm tắt, bấm để xem chi tiết
───────────────────────────────────────── */
function OrderCard({
  order,
  index,
  onView,
}: {
  order: Order;
  index: number;
  onView: () => void;
}) {
  const createdAt = new Date(order.createdAt).toLocaleString("vi-VN");
  const cancelled = order.status === "cancelled";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/60">
      {/* Header: icon + mã đơn + ngày + trạng thái + nút xem */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#007e42]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-base font-extrabold text-gray-800">
              Đơn Hàng {index}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">{createdAt}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <button
            type="button"
            onClick={onView}
            aria-label="Xem chi tiết đơn hàng"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-[#007e42] hover:text-[#007e42]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Thanh tiến trình */}
      {!cancelled && (
        <div className="mt-5">
          <OrderStepper status={order.status} />
        </div>
      )}

      {/* Footer: địa chỉ + tổng tiền */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">
        <span className="flex items-center gap-1.5 text-sm text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4 text-[#007e42]"
          >
            <path
              fillRule="evenodd"
              d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
          {order.shippingAddress?.address || "—"}
        </span>
        <span className="text-sm text-gray-600">
          Tổng tiền:{" "}
          <span className="text-base font-extrabold text-[#007e42]">
            {fmt(order.total)}
          </span>
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Modal chi tiết đơn hàng (chỉ hiện khi bấm xem)
───────────────────────────────────────── */
function OrderDetailModal({
  order,
  index,
  onClose,
}: {
  order: Order;
  index: number;
  onClose: () => void;
}) {
  /* Đóng modal khi nhấn ESC. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5 text-[#007e42]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            Chi Tiết Đơn Hàng <span className="text-[#007e42]">{index}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          {/* Hai cột: khách hàng + giao hàng */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#007e42]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clipRule="evenodd"
                  />
                </svg>
                Thông tin khách hàng
              </p>
              <p className="mt-3 text-sm text-gray-600">
                <span className="font-semibold text-gray-700">Tên:</span>{" "}
                {order.shippingAddress?.fullName || "—"}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                <span className="font-semibold text-gray-700">SĐT:</span>{" "}
                {order.shippingAddress?.phone || "—"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#007e42]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z" />
                  <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 00-3.732-10.104 1.837 1.837 0 00-1.47-.725H15.75z" />
                  <path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
                </svg>
                Giao hàng
              </p>
              <p className="mt-3 text-sm text-gray-600">
                <span className="font-semibold text-gray-700">Trạng thái:</span>{" "}
                <span className="font-semibold text-[#007e42]">
                  {(STATUS[order.status] ?? { label: order.status }).label}
                </span>
              </p>
              <p className="mt-1 text-sm text-gray-600">
                <span className="font-semibold text-gray-700">Địa chỉ:</span>{" "}
                {order.shippingAddress?.address || "—"}
              </p>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div>
            <h3 className="mb-3 text-base font-extrabold text-gray-800">
              Sản Phẩm Đã Đặt
            </h3>
            <div className="flex flex-col gap-3">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 rounded-xl border-2 border-gray-200 p-3"
                >
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
                    <p className="line-clamp-2 text-sm font-semibold text-gray-800">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {fmt(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-[#007e42]">
                    {fmt(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ghi chú nếu có */}
          {order.note && (
            <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <span className="font-semibold">Ghi chú:</span> {order.note}
            </p>
          )}

          {/* Tổng thanh toán */}
          <div className="flex items-center justify-between rounded-xl bg-amber-50 px-5 py-4">
            <span className="text-sm font-bold text-gray-700">
              Tổng thanh toán:
            </span>
            <span className="text-xl font-extrabold text-[#007e42]">
              {fmt(order.total)}
            </span>
          </div>
        </div>
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
  const [selected, setSelected] = useState<Order | null>(null);

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

  /* Số thứ tự hiển thị: đơn cũ nhất = 1, mới nhất = N (orders mới nhất ở đầu). */
  const orderNumber = useMemo(() => {
    const map = new Map<string, number>();
    const total = orders.length;
    orders.forEach((o, i) => map.set(o._id, total - i));
    return map;
  }, [orders]);

  /* ── Lọc theo tab ── */
  const filtered = useMemo(
    () => (tab === "all" ? orders : orders.filter((o) => o.status === tab)),
    [orders, tab],
  );

  /* ── Guard states ── */
  if (authLoading || (!user && !authLoading)) {
    return (
      <section className="min-h-screen bg-[#e5e7eb] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center text-sm text-gray-400">
          Đang tải...
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#e5e7eb] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-6 w-6 text-[#007e42]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
          Đơn Hàng Của Tôi
        </h1>
        <p className="mb-4 mt-1 text-sm text-gray-500">
          Quản lý và theo dõi trạng thái các đơn hàng của bạn
        </p>

        {/* Thanh tab lọc trạng thái (kiểu Shopee) */}
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-white p-1 shadow-md shadow-gray-200/60">
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
              <OrderCard
                key={order._id}
                order={order}
                index={orderNumber.get(order._id) ?? 0}
                onView={() => setSelected(order)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal chi tiết — chỉ hiện khi bấm xem một đơn */}
      {selected && (
        <OrderDetailModal
          order={selected}
          index={orderNumber.get(selected._id) ?? 0}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
