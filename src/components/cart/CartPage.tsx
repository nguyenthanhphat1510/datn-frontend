"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import type { CartItemResponse } from "@/services/cart";

const SHIPPING_FEE = 30000;
const FREE_SHIP_THRESHOLD = 500000;

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString("vi-VN") + "₫";
}

/* ─────────────────────────────────────────
   SVG Icons
───────────────────────────────────────── */
function ILeaf() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#007e42"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function ITrash() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function ICart() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function IArrowLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function ITag() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function IShield() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ITruck() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function ICheck() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IEmpty() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#007e42"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.3"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   Quantity Stepper
───────────────────────────────────────── */
function QuantityStepper({
  quantity,
  disabled,
  onIncrease,
  onDecrease,
}: {
  quantity: number;
  disabled?: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  return (
    <div className="flex items-center gap-0 rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={onDecrease}
        disabled={disabled || quantity <= 1}
        className="flex h-8 w-8 items-center justify-center text-gray-500 transition hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-medium"
        aria-label="Giảm số lượng"
      >
        −
      </button>
      <span className="flex h-8 w-10 items-center justify-center border-x border-gray-200 text-sm font-semibold text-gray-800">
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        disabled={disabled}
        className="flex h-8 w-8 items-center justify-center text-gray-500 transition hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-medium"
        aria-label="Tăng số lượng"
      >
        +
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   Cart Item Row
───────────────────────────────────────── */
function CartItemRow({
  item,
  checked,
  disabled,
  onCheck,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: CartItemResponse;
  checked: boolean;
  disabled?: boolean;
  onCheck: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all duration-200 ${
        checked ? "border-[#007e42]/30 shadow-md" : "border-gray-100"
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onCheck}
        aria-checked={checked}
        role="checkbox"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
          checked
            ? "border-[#007e42] bg-[#007e42] text-white"
            : "border-gray-300 hover:border-[#007e42]"
        }`}
      >
        {checked && <ICheck />}
      </button>

      {/* Product Image */}
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-emerald-50 to-teal-100">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <ILeaf />
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={`/san-pham/${item.productId}`}
          className="line-clamp-2 text-sm font-bold uppercase leading-snug text-gray-800 transition hover:text-[#007e42]"
        >
          {item.name}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#007e42]">
            {fmt(item.price)}
          </span>
        </div>
      </div>

      {/* Quantity */}
      <div className="flex shrink-0 flex-col items-center gap-2">
        <QuantityStepper
          quantity={item.quantity}
          disabled={disabled}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
        />
      </div>

      {/* Subtotal */}
      <div className="w-28 shrink-0 text-right">
        <p className="text-base font-bold text-gray-800">{fmt(item.subtotal)}</p>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        disabled={disabled}
        title="Xóa sản phẩm"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
      >
        <ITrash />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   Coupon Input (UI tĩnh — chưa nối backend)
───────────────────────────────────────── */
function CouponInput() {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");

  function handleApply() {
    if (!code.trim()) return;
    if (code.trim().toUpperCase() === "AGRI10") {
      setApplied(true);
      setError("");
    } else {
      setError("Mã giảm giá không hợp lệ");
      setApplied(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ITag />
          </span>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
              setApplied(false);
            }}
            placeholder='Thử "AGRI10"'
            className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none transition ${
              applied
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : error
                ? "border-red-300 bg-red-50"
                : "border-gray-200 focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]/20"
            }`}
          />
        </div>
        <button
          onClick={handleApply}
          className="shrink-0 rounded-lg bg-[#007e42] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#005f32] active:scale-95"
        >
          Áp dụng
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {applied && (
        <p className="text-xs font-medium text-emerald-600">
          ✓ Đã áp dụng mã giảm 10%!
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Order Summary
───────────────────────────────────────── */
function OrderSummary({
  subtotal,
  checkedCount,
}: {
  subtotal: number;
  checkedCount: number;
}) {
  const shipping = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const toFreeShip = FREE_SHIP_THRESHOLD - subtotal;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#007e42]/15 bg-white p-5 shadow-lg">
      <h2 className="text-base font-bold text-gray-800">Tóm tắt đơn hàng</h2>

      {/* Free ship progress */}
      {shipping > 0 && subtotal > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
          <p className="text-xs text-amber-700 font-medium">
            Mua thêm{" "}
            <span className="font-bold">{fmt(toFreeShip)}</span> để được{" "}
            <span className="font-bold text-emerald-600">miễn phí vận chuyển!</span>
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-amber-200">
            <div
              className="h-full rounded-full bg-[#007e42] transition-all duration-500"
              style={{
                width: `${Math.min((subtotal / FREE_SHIP_THRESHOLD) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {shipping === 0 && subtotal >= FREE_SHIP_THRESHOLD && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700">
          🎉 Bạn được miễn phí vận chuyển!
        </div>
      )}

      {/* Price rows */}
      <div className="flex flex-col gap-2.5 border-t border-gray-100 pt-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tạm tính ({checkedCount} sản phẩm)</span>
          <span className="font-medium text-gray-800">{fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Phí vận chuyển</span>
          {shipping === 0 ? (
            <span className="font-medium text-emerald-600">Miễn phí</span>
          ) : (
            <span className="font-medium text-gray-800">{fmt(shipping)}</span>
          )}
        </div>
      </div>

      {/* Coupon */}
      <div className="border-t border-gray-100 pt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Mã giảm giá
        </p>
        <CouponInput />
      </div>

      {/* Total */}
      <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
        <span className="text-sm font-bold text-gray-700">Tổng cộng</span>
        <span className="text-lg font-extrabold text-[#007e42]">
          {fmt(total)}
        </span>
      </div>

      {/* Checkout button — chưa nối đặt hàng (ngoài phạm vi) */}
      <button
        disabled={checkedCount === 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#007e42] py-3 text-sm font-bold text-white shadow-md shadow-[#007e42]/25 transition hover:bg-[#005f32] active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
      >
        <ICart />
        Tiến hành thanh toán ({checkedCount})
      </button>

      {/* Trust badges */}
      <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-3">
        {[
          { icon: <IShield />, text: "Thanh toán bảo mật 100%" },
          { icon: <ITruck />, text: "Giao hàng toàn quốc" },
          { icon: <ICheck />, text: "Đổi trả trong 7 ngày" },
        ].map((b) => (
          <div key={b.text} className="flex items-center gap-2 text-xs text-gray-500">
            <span className="text-[#007e42]">{b.icon}</span>
            {b.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Empty State
───────────────────────────────────────── */
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-24 text-center">
      <IEmpty />
      <h3 className="mt-4 text-lg font-bold text-gray-700">Giỏ hàng trống</h3>
      <p className="mt-1 text-sm text-gray-400">
        Bạn chưa thêm sản phẩm nào vào giỏ hàng
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#007e42] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#007e42]/25 transition hover:bg-[#005f32]"
      >
        <IArrowLeft />
        Tiếp tục mua sắm
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────
   Trạng thái chưa đăng nhập
───────────────────────────────────────── */
function NeedLogin() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-24 text-center">
      <IEmpty />
      <h3 className="mt-4 text-lg font-bold text-gray-700">
        Vui lòng đăng nhập
      </h3>
      <p className="mt-1 text-sm text-gray-400">
        Bạn cần đăng nhập để xem giỏ hàng của mình
      </p>
      <Link
        href="/dang-nhap"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#007e42] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#007e42]/25 transition hover:bg-[#005f32]"
      >
        Đăng nhập
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main CartPage
───────────────────────────────────────── */
export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading, updateItem, removeItem } = useCart();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const items = cart?.items ?? [];

  /* helpers */
  function toggleCheck(productId: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function toggleAll() {
    if (checkedIds.size === items.length) setCheckedIds(new Set());
    else setCheckedIds(new Set(items.map((i) => i.productId)));
  }

  // Bọc mỗi mutation để chặn double-click và hiển thị lỗi backend
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setBusy(false);
    }
  }

  function increase(item: CartItemResponse) {
    void run(() => updateItem(item.productId, item.quantity + 1));
  }

  function decrease(item: CartItemResponse) {
    if (item.quantity <= 1) return;
    void run(() => updateItem(item.productId, item.quantity - 1));
  }

  function remove(productId: string) {
    void run(() => removeItem(productId));
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  }

  async function removeChecked() {
    const ids = items
      .map((i) => i.productId)
      .filter((id) => checkedIds.has(id));
    await run(async () => {
      for (const id of ids) {
        await removeItem(id);
      }
    });
    setCheckedIds(new Set());
  }

  /* derived — chỉ tính trên item đã tick */
  const checkedItems = items.filter((i) => checkedIds.has(i.productId));
  const subtotal = checkedItems.reduce((sum, i) => sum + i.subtotal, 0);
  const checkedCount = checkedItems.reduce((sum, i) => sum + i.quantity, 0);
  const allChecked = items.length > 0 && checkedIds.size === items.length;

  /* ── Chưa đăng nhập ── */
  if (!authLoading && !user) {
    return (
      <section className="min-h-screen bg-gray-50/60 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <NeedLogin />
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50/60 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* ── Header ── */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm transition hover:border-[#007e42]/30 hover:text-[#007e42]"
          >
            <IArrowLeft />
            Tiếp tục mua sắm
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-gray-800">Giỏ hàng</h1>
            {items.length > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#007e42] px-1.5 text-xs font-bold text-white">
                {items.length}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {loading && items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-24 text-center text-sm text-gray-400">
            Đang tải giỏ hàng...
          </div>
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* ── Left: items ── */}
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              {/* Toolbar */}
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm">
                {/* Select all */}
                <button
                  onClick={toggleAll}
                  aria-checked={allChecked}
                  role="checkbox"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                    allChecked
                      ? "border-[#007e42] bg-[#007e42] text-white"
                      : "border-gray-300 hover:border-[#007e42]"
                  }`}
                >
                  {allChecked && <ICheck />}
                </button>
                <span className="flex-1 text-sm text-gray-600">
                  Chọn tất cả ({items.length} sản phẩm)
                </span>

                {checkedIds.size > 0 && (
                  <button
                    onClick={removeChecked}
                    disabled={busy}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                  >
                    <ITrash />
                    Xóa đã chọn ({checkedIds.size})
                  </button>
                )}
              </div>

              {/* Item list */}
              <div className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <CartItemRow
                    key={item.productId}
                    item={item}
                    checked={checkedIds.has(item.productId)}
                    disabled={busy}
                    onCheck={() => toggleCheck(item.productId)}
                    onIncrease={() => increase(item)}
                    onDecrease={() => decrease(item)}
                    onRemove={() => remove(item.productId)}
                  />
                ))}
              </div>

              {/* Mobile order summary (hidden on lg) */}
              <div className="lg:hidden">
                <OrderSummary subtotal={subtotal} checkedCount={checkedCount} />
              </div>
            </div>

            {/* ── Right: summary (sticky on lg) ── */}
            <div className="hidden w-80 shrink-0 lg:block lg:sticky lg:top-24">
              <OrderSummary subtotal={subtotal} checkedCount={checkedCount} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
