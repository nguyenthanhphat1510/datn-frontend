"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { fmt } from "@/lib/format";
import { getAddresses, createAddress, type Address } from "@/services/addresses";
import { createOrder, type CreateOrderInput } from "@/services/orders";
import AddressForm, {
  EMPTY_ADDRESS,
  validateAddress,
  type AddressFormValues,
} from "./AddressForm";

const SHIPPING_FEE = 30000;
const FREE_SHIP_THRESHOLD = 500000;

/** Key tạm để truyền Order vừa tạo sang trang "đặt hàng thành công". */
export const ORDER_SUCCESS_KEY = "last_order";

type Mode = "select" | "new"; // chọn từ sổ | nhập địa chỉ mới

/* ─────────────────────────────────────────
   Icons (inline SVG — tông xanh #007e42)
───────────────────────────────────────── */
function IWallet() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function IMapPin() {
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
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ICheck() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ITruck() {
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
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

function IBank() {
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
      <path d="m3 21 18 0" />
      <path d="M3 10h18" />
      <path d="m5 6 7-3 7 3" />
      <path d="M4 10v11" />
      <path d="M20 10v11" />
      <path d="M8 14v3" />
      <path d="M12 14v3" />
      <path d="M16 14v3" />
    </svg>
  );
}

/* Phương thức thanh toán (UI-only — backend chưa xử lý) */
type PayMethod = "cod" | "vnpay" | "momo";

const PAY_METHODS: {
  id: PayMethod;
  label: string;
  desc: string;
  icon: ReactNode;
}[] = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng (COD)",
    desc: "Trả tiền mặt khi nhận sách",
    icon: <ITruck />,
  },
  {
    id: "vnpay",
    label: "VNPAY",
    desc: "Quét QR / thẻ ngân hàng (Đang bảo trì)",
    icon: <IBank />,
  },
  {
    id: "momo",
    label: "Ví MoMo",
    desc: "Thanh toán qua ví MoMo (Đang bảo trì)",
    icon: <IBank />,
  },
];

/* ─────────────────────────────────────────
   Tóm tắt một dòng địa chỉ trong sổ
───────────────────────────────────────── */
function AddressRadio({
  addr,
  checked,
  onSelect,
}: {
  addr: Address;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
        checked
          ? "border-[#007e42] bg-[#007e42]/5 shadow-sm"
          : "border-gray-200 hover:border-[#007e42]/40"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? "border-[#007e42]" : "border-gray-300"
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-[#007e42]" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-gray-800">
            {addr.fullName}
          </span>
          <span className="text-sm text-gray-500">{addr.phone}</span>
          {addr.isDefault && (
            <span className="rounded bg-[#007e42]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#007e42]">
              Mặc định
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-gray-600">{addr.address}</p>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────
   Main CheckoutPage
───────────────────────────────────────── */
export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading, refresh } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("select");
  const [selectedId, setSelectedId] = useState<string>("");

  const [form, setForm] = useState<AddressFormValues>(EMPTY_ADDRESS);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof AddressFormValues, string>>
  >({});

  const [note, setNote] = useState("");
  const [payMethod, setPayMethod] = useState<PayMethod>("cod");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const items = cart?.items ?? [];

  /* ── Chặn chưa đăng nhập ── */
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/dang-nhap");
    }
  }, [authLoading, user, router]);

  /* ── Tải sổ địa chỉ ── */
  useEffect(() => {
    if (!user) return;
    let active = true;
    setAddrLoading(true);
    getAddresses()
      .then((list) => {
        if (!active) return;
        setAddresses(list);
        if (list.length === 0) {
          setMode("new"); // chưa có địa chỉ → form nhập tay
        } else {
          setMode("select");
          const def = list.find((a) => a.isDefault) ?? list[0];
          setSelectedId(def._id);
        }
      })
      .catch(() => {
        if (active) setMode("new"); // lỗi tải sổ → vẫn cho nhập tay
      })
      .finally(() => {
        if (active) setAddrLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  /* ── Tính tiền (toàn giỏ vì đặt cả giỏ) ── */
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.subtotal, 0),
    [items],
  );
  const shipping = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  /* ── Đặt hàng ── */
  async function handlePlaceOrder() {
    if (busy) return;
    setError("");

    // Dựng body: ưu tiên addressId nếu đang chọn từ sổ, ngược lại nhập tay.
    let body: CreateOrderInput;
    if (mode === "select" && selectedId) {
      body = { addressId: selectedId, note: note.trim() || undefined };
    } else {
      const errs = validateAddress(form);
      if (Object.keys(errs).length > 0) {
        setFormErrors(errs);
        return;
      }
      setFormErrors({});
      body = {
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
        },
        note: note.trim() || undefined,
      };
    }

    setBusy(true);
    try {
      // Lưu vào sổ nếu user chọn (best-effort, không chặn đặt hàng nếu lỗi).
      if (mode === "new" && form.saveToBook) {
        try {
          await createAddress({
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            isDefault: addresses.length === 0, // địa chỉ đầu tiên → mặc định
          });
        } catch {
          /* bỏ qua — vẫn tiếp tục đặt hàng với shippingAddress đã nhập */
        }
      }

      const order = await createOrder(body);

      // Truyền Order sang trang success qua sessionStorage rồi điều hướng.
      try {
        sessionStorage.setItem(ORDER_SUCCESS_KEY, JSON.stringify(order));
      } catch {
        /* sessionStorage có thể không khả dụng — trang success có fallback */
      }
      await refresh(); // đồng bộ giỏ (backend đã clear) → badge về 0
      router.replace("/dat-hang-thanh-cong");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đặt hàng thất bại");
      setBusy(false);
    }
  }

  /* ── Render guard states ── */
  if (authLoading || (!user && !authLoading)) {
    return (
      <section className="min-h-screen bg-[#e5e7eb] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl text-center text-sm text-gray-400">
          Đang tải...
        </div>
      </section>
    );
  }

  if (cartLoading && items.length === 0) {
    return (
      <section className="min-h-screen bg-[#e5e7eb] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-2xl border border-dashed border-gray-200 bg-white py-24 text-center text-sm text-gray-400">
          Đang tải...
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="min-h-screen bg-[#e5e7eb] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-24 text-center">
            <h3 className="text-lg font-bold text-gray-700">Giỏ hàng trống</h3>
            <p className="mt-1 text-sm text-gray-400">
              Bạn cần có sản phẩm trong giỏ để thanh toán
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#007e42] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#007e42]/25 transition hover:bg-[#005f32]"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#e5e7eb] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-gray-800">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#007e42]/10 text-[#007e42]">
              <IWallet />
            </span>
            Thanh Toán Đơn Hàng
          </h1>
          <Link
            href="/gio-hang"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm transition hover:border-[#007e42]/30 hover:text-[#007e42]"
          >
            ← Quay lại giỏ hàng
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* ── Trái: địa chỉ giao hàng ── */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-800">
                  <span className="text-[#007e42]">
                    <IMapPin />
                  </span>
                  Thông Tin Nhận Hàng
                </h2>
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setMode((m) => (m === "select" ? "new" : "select"))
                    }
                    className="text-sm font-semibold text-[#007e42] hover:underline"
                  >
                    {mode === "select" ? "+ Thêm địa chỉ mới" : "Chọn từ sổ"}
                  </button>
                )}
              </div>

              {addrLoading ? (
                <p className="text-sm text-gray-400">Đang tải địa chỉ...</p>
              ) : mode === "select" && addresses.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {addresses.map((addr) => (
                    <AddressRadio
                      key={addr._id}
                      addr={addr}
                      checked={selectedId === addr._id}
                      onSelect={() => setSelectedId(addr._id)}
                    />
                  ))}
                </div>
              ) : (
                <AddressForm
                  values={form}
                  errors={formErrors}
                  showSave={!!user}
                  onChange={setForm}
                />
              )}
            </div>

            {/* Phương thức thanh toán (UI-only) */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
              <h2 className="mb-4 text-base font-bold text-gray-800">
                Phương thức thanh toán
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {PAY_METHODS.map((m) => {
                  const checked = payMethod === m.id;
                  const disabled = m.id !== "cod"; // chỉ COD khả dụng
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => setPayMethod(m.id)}
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                        checked
                          ? "border-[#007e42] bg-[#007e42]/5 shadow-sm"
                          : "border-gray-200 hover:border-[#007e42]/40"
                      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <span
                        className={`shrink-0 ${
                          checked ? "text-[#007e42]" : "text-gray-400"
                        }`}
                      >
                        {m.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-gray-800">
                          {m.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-500">
                          {m.desc}
                        </span>
                      </span>
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition ${
                          checked
                            ? "bg-[#007e42] text-white"
                            : "border-2 border-gray-300"
                        }`}
                      >
                        {checked && <ICheck />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Phải: tóm tắt đơn ── */}
          <div className="w-full shrink-0 lg:sticky lg:top-24 lg:w-96">
            <div className="flex flex-col gap-4 rounded-2xl border border-[#007e42]/15 bg-white p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-800">
                  Sản Phẩm Của Bạn
                </h2>
                <span className="rounded-full bg-[#007e42]/10 px-2.5 py-0.5 text-xs font-semibold text-[#007e42]">
                  {items.reduce((n, i) => n + i.quantity, 0)} món
                </span>
              </div>

              {/* Danh sách item */}
              <div className="flex max-h-64 flex-col gap-3 overflow-y-auto border-b border-gray-100 pb-3">
                {items.map((item) => (
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

              {/* Giá */}
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium text-gray-800">
                    {fmt(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Phí vận chuyển</span>
                  {shipping === 0 ? (
                    <span className="font-medium text-emerald-600">
                      Miễn phí
                    </span>
                  ) : (
                    <span className="font-medium text-gray-800">
                      {fmt(shipping)}
                    </span>
                  )}
                </div>
              </div>

              {/* Ghi chú */}
              <div className="flex flex-col gap-1 border-t border-gray-100 pt-3">
                <label className="text-xs font-semibold text-gray-600">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Ví dụ: Giao giờ hành chính..."
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]/20"
                />
              </div>

              {/* Tổng */}
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="text-sm font-bold text-gray-700">
                  Tổng cộng
                </span>
                <span className="text-lg font-extrabold text-[#007e42]">
                  {fmt(total)}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#007e42] py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-[#007e42]/25 transition hover:bg-[#005f32] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? (
                  "Đang đặt hàng..."
                ) : (
                  <>
                    Xác Nhận Đặt Hàng
                    <ICheck />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
