"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { fmt } from "@/lib/format";
import {
  getOrders,
  getVnpayUrl,
  type Order,
  type OrderItem,
} from "@/services/orders";
import { getReviewedProductIds } from "@/services/reviews";
import ReviewForm from "@/components/product-detail/ReviewForm";

/* Map trạng thái đơn → nhãn tiếng Việt + màu badge trắng (nổi trên header xanh). */
const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Chờ xác nhận", cls: "bg-white text-amber-700" },
  confirmed: { label: "Đang xử lý", cls: "bg-white text-blue-700" },
  shipping: { label: "Đang giao", cls: "bg-white text-indigo-700" },
  delivered: { label: "Hoàn thành", cls: "bg-white text-[#007e42]" },
  cancelled: { label: "Đã hủy", cls: "bg-white text-red-600" },
};

/* Phương thức thanh toán → nhãn + logo (khớp PaymentMethod backend).
   COD không có logo (icon = null) → chỉ hiện chữ. */
const PAY_METHOD: Record<string, { label: string; icon: string | null }> = {
  cod: { label: "COD", icon: null },
  vnpay: { label: "VNPAY", icon: "/vnpay.png" },
  // Cổng MoMo đã gỡ — giữ nhãn để đơn cũ trong DB vẫn hiển thị đọc được.
  momo: { label: "MoMo", icon: null },
};

/* Thẻ phương thức thanh toán: logo (nếu có) + tên. Dùng ở dải giao hàng. */
function PaymentMethod({ method }: { method?: string }) {
  const m = PAY_METHOD[method ?? "cod"] ?? { label: method ?? "—", icon: null };
  return (
    <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
      {m.icon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={m.icon} alt={m.label} className="h-5 w-5 shrink-0 rounded-sm object-contain" />
      )}
      {m.label}
    </span>
  );
}

/* Trạng thái thanh toán → nhãn + màu badge (khớp PaymentStatus backend). */
const PAY_STATUS: Record<string, { label: string; cls: string }> = {
  unpaid: { label: "Chưa thanh toán", cls: "bg-amber-100 text-amber-700" },
  paid: { label: "Đã thanh toán", cls: "bg-[#007e42]/10 text-[#007e42]" },
  failed: { label: "Thanh toán lỗi", cls: "bg-red-100 text-red-600" },
};

function PaymentBadge({ status }: { status?: string }) {
  if (!status) return null;
  const s = PAY_STATUS[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
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

/* ─────────────────────────────────────────
   Một dòng sản phẩm trong đơn (ảnh + tên + SL + giá) — hiện ngay trên card.
   Đơn đã giao thì có nút đánh giá inline (giống Shopee).
───────────────────────────────────────── */
function OrderItemRow({
  item,
  orderId,
  delivered,
  reviewed,
  onReviewed,
}: {
  item: OrderItem;
  orderId: string;
  delivered: boolean;
  reviewed: boolean;
  onReviewed: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col border-b border-gray-100 py-3 last:border-b-0">
      <div className="flex gap-3">
        {/* Ảnh */}
        <Link
          href={`/san-pham/${item.productId}`}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white"
        >
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-contain p-1"
            />
          ) : null}
        </Link>

        {/* Tên + số lượng */}
        <div className="min-w-0 flex-1">
          <Link
            href={`/san-pham/${item.productId}`}
            className="line-clamp-2 text-sm font-medium text-gray-800 transition hover:text-[#007e42]"
          >
            {item.name}
          </Link>
          <p className="mt-1 text-xs text-gray-400">x{item.quantity}</p>

          {/* Đơn đã giao → nút đánh giá / trạng thái đã đánh giá */}
          {delivered &&
            (reviewed ? (
              <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                ✓ Đã đánh giá
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="mt-1.5 inline-flex items-center gap-1 rounded border border-[#007e42] px-2.5 py-0.5 text-xs font-semibold text-[#007e42] transition hover:bg-[#007e42] hover:text-white"
              >
                ★ {open ? "Đóng" : "Đánh giá"}
              </button>
            ))}
        </div>

        {/* Giá */}
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-[#007e42]">{fmt(item.price)}</p>
        </div>
      </div>

      {/* Form đánh giá inline */}
      {delivered && open && !reviewed && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <ReviewForm
            orderId={orderId}
            productId={item.productId}
            onDone={() => {
              setOpen(false);
              onReviewed();
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Một card đơn hàng kiểu Shopee — item hiện ngay trên card.
───────────────────────────────────────── */
function OrderCard({ order, index }: { order: Order; index: number }) {
  const { showToast } = useToast();
  const status = STATUS[order.status] ?? { label: order.status, cls: "text-gray-500" };
  const delivered = order.status === "delivered";
  const createdAt = new Date(order.createdAt).toLocaleDateString("vi-VN");
  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

  const [paying, setPaying] = useState(false);

  /* Đơn cổng online còn nợ tiền → cho trả lại.
     Điều kiện khớp đúng các chốt chặn của backend getVnpayUrl: phải là vnpay,
     chưa PAID, và chưa bị hủy (đơn hủy đã hoàn kho, backend từ chối thu tiếp).
     Hiện nút mà backend từ chối thì chỉ tổ làm khách bực. */
  const canRetryPayment =
    order.paymentMethod === "vnpay" &&
    order.paymentStatus !== "paid" &&
    order.status !== "cancelled";

  async function handleRetryPayment() {
    if (paying) return;
    setPaying(true);
    try {
      const { paymentUrl } = await getVnpayUrl(order._id);
      window.location.href = paymentUrl; // sang cổng — không tắt cờ paying
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Không lấy được link thanh toán",
        "error",
      );
      setPaying(false);
    }
  }

  // productId đã đánh giá trong đơn này → ẩn nút "Đánh giá"
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);

  const loadReviewed = useCallback(() => {
    if (!delivered) return;
    getReviewedProductIds(order._id)
      .then(setReviewedIds)
      .catch(() => setReviewedIds([]));
  }, [delivered, order._id]);

  useEffect(() => {
    loadReviewed();
  }, [loadReviewed]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* Header xanh: mã đơn + ngày + badge thanh toán bên trái, trạng thái bên phải */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#007e42] px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-white">Đơn hàng #{index}</span>
          <span className="text-xs text-white/60">{createdAt}</span>
          <PaymentBadge status={order.paymentStatus} />
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.cls}`}>
          {status.label}
        </span>
      </div>

      {/* Danh sách sản phẩm — hiện ngay trên card */}
      <div className="px-4">
        {order.items.map((item) => (
          <OrderItemRow
            key={item.productId}
            item={item}
            orderId={order._id}
            delivered={delivered}
            reviewed={reviewedIds.includes(item.productId)}
            onReviewed={loadReviewed}
          />
        ))}
      </div>

      {/* Dải giao hàng: địa chỉ + phương thức thanh toán (1 dòng gọn) */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-gray-300 px-4 py-2 text-xs text-gray-500">
        <span className="inline-flex min-w-0 items-center gap-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-[#007e42]">
            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <span className="truncate">
            {order.shippingAddress?.fullName} · {order.shippingAddress?.phone} · {order.shippingAddress?.address || "—"}
          </span>
        </span>
        <PaymentMethod method={order.paymentMethod} />
      </div>

      {/* Ghi chú nếu có */}
      {order.note && (
        <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
          <span className="font-semibold text-gray-600">Ghi chú:</span> {order.note}
        </div>
      )}

      {/* Footer: phí ship + tổng tiền (+ nút trả tiền lại nếu đơn còn nợ) */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-gray-300 bg-gray-200 px-4 py-3">
        {/* Nút nằm BÊN TRÁI, tách khỏi cụm tiền bên phải: để cạnh "Thành tiền"
            thì dễ bấm nhầm khi khách chỉ định liếc xem hết bao nhiêu. */}
        {canRetryPayment ? (
          <button
            type="button"
            onClick={handleRetryPayment}
            disabled={paying}
            className="rounded-lg bg-[#007e42] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#005f32] active:scale-95 disabled:opacity-60"
          >
            {paying ? "Đang mở cổng..." : "Thanh toán lại"}
          </button>
        ) : (
          // Ô rỗng giữ chỗ để cụm tiền luôn dạt phải, dù đơn có nút hay không.
          <span />
        )}

        <div className="flex flex-col items-end gap-0.5">
          <span className="text-xs text-gray-400">
            Phí vận chuyển: {order.shippingFee > 0 ? fmt(order.shippingFee) : "Miễn phí"}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-gray-500">
              Thành tiền ({totalQty} sản phẩm):
            </span>
            <span className="text-lg font-extrabold text-[#007e42]">
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
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
