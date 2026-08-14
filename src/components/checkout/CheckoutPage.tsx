"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { fmt } from "@/lib/format";
import {
  getAddresses,
  createAddress,
  type Address,
  type PlaceDetail,
} from "@/services/addresses";
import { SHOP_LOCATION } from "@/lib/shop-location";
import {
  createOrder,
  getVnpayUrl,
  getShippingFee,
  type CreateOrderInput,
  type ShippingFeeResult,
} from "@/services/orders";
import AddressForm, {
  EMPTY_ADDRESS,
  validateAddress,
  type AddressFormValues,
} from "./AddressForm";

/** Key tạm để truyền Order vừa tạo sang trang "đặt hàng thành công". */
export const ORDER_SUCCESS_KEY = "last_order";

/**
 * Phí ship cơ bản — CHỈ dùng làm giá trị hiển thị tạm ở lượt render đầu, trước
 * khi backend trả phí thật.
 *
 * Phải khớp BASE_FEE trong backend/src/common/shipping.ts. Không tính phí ở
 * frontend nữa (backend chốt qua GET /orders/shipping-fee), nhưng vẫn cần một
 * con số hợp lý để không hiện 0 ₫ trong lúc chờ mạng.
 */
const BASE_SHIPPING_FEE = 15_000;

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

/* Phương thức thanh toán (UI-only — backend chưa xử lý) */
type PayMethod = "cod" | "vnpay";

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
    desc: "Quét QR / thẻ ngân hàng (Sandbox)",
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/vnpay.png" alt="VNPAY" className="h-6 w-6 rounded object-contain" />
    ),
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
          ? "border-[#007e42] bg-[#007e42]/10 shadow-sm"
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
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading, refresh } = useCart();
  const { showToast } = useToast();

  // Sản phẩm được chọn từ giỏ (?items=id1,id2). Rỗng = đặt cả giỏ.
  const selectedProductIds = useMemo(() => {
    const raw = searchParams.get("items");
    return raw ? raw.split(",").filter(Boolean) : [];
  }, [searchParams]);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("select");
  const [selectedId, setSelectedId] = useState<string>("");

  const [form, setForm] = useState<AddressFormValues>(EMPTY_ADDRESS);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof AddressFormValues, string>>
  >({});
  // Địa chỉ chi tiết (lat/lon/quận/thành phố) khi user chọn 1 gợi ý từ autocomplete.
  const [placeDetail, setPlaceDetail] = useState<PlaceDetail | null>(null);
  // Chuỗi địa chỉ ĐÚNG LÚC user bấm chọn gợi ý — để biết sau đó họ có sửa tay
  // không. Xem `toaDoConHopLe`.
  const [pickedAddress, setPickedAddress] = useState("");

  /**
   * Toạ độ của `placeDetail` có còn dùng được cho địa chỉ đang gõ không.
   *
   * Chỉ kèm lat/lon khi ô địa chỉ vẫn ĐÚNG chuỗi đã chọn từ gợi ý — sửa tay xong
   * mà vẫn gắn toạ độ cũ thì giao nhầm chỗ.
   *
   * ⚠️ So với `pickedAddress` (chuỗi hiện trong ô nhập), KHÔNG so với
   * `placeDetail.address`: gogoduk /v1/place/resolve trả chuỗi dài hơn
   * /v1/suggest — nó thêm ", Việt Nam" ở cuối. So nhầm sang đó thì không bao giờ
   * khớp, và toạ độ bị vứt ở MỌI lần đặt hàng (chính là lỗi địa chỉ trong sổ có
   * lat/lon = null).
   */
  const toaDoConHopLe = (diaChi: string) =>
    placeDetail !== null && pickedAddress !== "" && pickedAddress === diaChi;

  const [note, setNote] = useState("");
  const [payMethod, setPayMethod] = useState<PayMethod>("cod");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Chỉ hiển thị & đặt các sản phẩm đã chọn từ giỏ; rỗng = cả giỏ.
  const allItems = cart?.items ?? [];
  const items =
    selectedProductIds.length > 0
      ? allItems.filter((i) => selectedProductIds.includes(i.productId))
      : allItems;

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

  // Toạ độ hiệu dụng để tính phí ship:
  // - mode "new": từ địa chỉ vừa chọn ở gợi ý, và CHỈ khi ô nhập chưa bị sửa tay
  //   — dùng cùng điều kiện với lúc gửi đơn, để phí xem trước đúng bằng phí bị
  //   chốt (sửa tay thì bỏ toạ độ ở cả hai chỗ).
  // - mode "select": từ địa chỉ đang chọn trong sổ (nếu đã lưu lat/lon)
  const selectedAddr = addresses.find((a) => a._id === selectedId);
  const latLon =
    mode === "new"
      ? toaDoConHopLe(form.address.trim())
        ? { lat: placeDetail?.lat, lon: placeDetail?.lon }
        : { lat: undefined, lon: undefined }
      : { lat: selectedAddr?.lat, lon: selectedAddr?.lon };

  /* ── Phí ship: HỎI BACKEND, không tự tính ──
     Backend đo quãng đường thật qua gogoduk (API key ở server nên frontend không
     gọi thẳng được), và cũng chính con số đó được chốt khi tạo đơn — hết cảnh
     hai bên tự tính rồi lệch nhau.

     Trong lúc chờ mạng thì giữ NGUYÊN phí cũ thay vì nhảy về 0: người dùng đang
     nhìn dòng tổng tiền, cho nó nháy về 0 rồi lại nhảy lên trông như tính sai. */
  // Khởi tạo bằng PHÍ CƠ BẢN chứ không phải 0: lượt render đầu (trước khi API
  // trả về) mà hiện "Phí vận chuyển: 0 ₫" thì khách đọc nhầm là được miễn ship,
  // rồi con số nhảy lên sau một nhịp — nhìn như trang tự đổi giá.
  const [shippingInfo, setShippingInfo] = useState<ShippingFeeResult>({
    fee: BASE_SHIPPING_FEE,
    distanceKm: null,
    source: "haversine",
    isFar: false,
  });
  const [feeLoading, setFeeLoading] = useState(false);

  const { lat: shipLat, lon: shipLon } = latLon;

  useEffect(() => {
    let active = true;
    // setState nằm trong callback bất đồng bộ (không gọi thẳng trong thân
    // effect) để tránh cascading render — cùng quy ước với CartContext.
    Promise.resolve()
      .then(() => {
        if (active) setFeeLoading(true);
      })
      .then(() => getShippingFee(shipLat, shipLon))
      .then((res) => {
        if (active) setShippingInfo(res);
      })
      .catch(() => {
        /* lỗi mạng → giữ phí đang hiện, người dùng vẫn đặt hàng được vì backend
           mới là nơi chốt phí thật lúc tạo đơn */
      })
      .finally(() => {
        if (active) setFeeLoading(false);
      });
    return () => {
      active = false;
    };
  }, [shipLat, shipLon]);

  const shipping = shippingInfo.fee;
  const distanceKm = shippingInfo.distanceKm;
  const total = subtotal + shipping;

  // Có toạ độ để xác định vị trí giao? (đúng cho cả nhập mới lẫn chọn từ sổ)
  const hasGeo = latLon.lat != null && latLon.lon != null;
  // Dòng mô tả vị trí: mode "new" hiện quận/thành phố từ resolve;
  // mode "select" hiện chuỗi địa chỉ của địa chỉ đang chọn trong sổ.
  const geoArea =
    mode === "new"
      ? placeDetail
        ? [placeDetail.district, placeDetail.city].filter(Boolean).join(", ")
        : ""
      : (selectedAddr?.address ?? "");

  /* ── Đặt hàng ── */
  async function handlePlaceOrder() {
    if (busy) return;
    setError("");

    // Dựng body: ưu tiên addressId nếu đang chọn từ sổ, ngược lại nhập tay.
    // COD và VNPay đều được gửi lên backend.
    const paymentMethod = payMethod; // "cod" | "vnpay"

    // Gửi kèm danh sách sản phẩm đã chọn (nếu có) để backend chỉ đặt các item đó.
    const productIds =
      selectedProductIds.length > 0 ? selectedProductIds : undefined;

    let body: CreateOrderInput;
    if (mode === "select" && selectedId) {
      body = {
        addressId: selectedId,
        productIds,
        note: note.trim() || undefined,
        paymentMethod,
      };
    } else {
      const errs = validateAddress(form);
      if (Object.keys(errs).length > 0) {
        setFormErrors(errs);
        return;
      }
      setFormErrors({});
      // Chỉ kèm lat/lon khi địa chỉ form đúng là cái vừa chọn (chưa sửa tay).
      const resolved = toaDoConHopLe(form.address.trim()) ? placeDetail : null;
      body = {
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          lat: resolved?.lat,
          lon: resolved?.lon,
        },
        productIds,
        note: note.trim() || undefined,
        paymentMethod,
      };
    }

    setBusy(true);
    try {
      // Lưu vào sổ nếu user chọn (best-effort, không chặn đặt hàng nếu lỗi).
      if (mode === "new" && form.saveToBook) {
        const resolved = toaDoConHopLe(form.address.trim()) ? placeDetail : null;
        try {
          await createAddress({
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            lat: resolved?.lat,
            lon: resolved?.lon,
            isDefault: addresses.length === 0, // địa chỉ đầu tiên → mặc định
          });
        } catch {
          /* bỏ qua — vẫn tiếp tục đặt hàng với shippingAddress đã nhập */
        }
      }

      const order = await createOrder(body);

      // ── Cổng online: lấy URL thanh toán rồi redirect ──
      // Đơn đã được tạo (chưa thanh toán), giỏ đã được backend clear.
      if (paymentMethod === "vnpay") {
        // Từ đây trở đi KHÔNG được báo "Đặt hàng thất bại" nữa: đơn đã tạo xong
        // và giỏ đã bị backend xóa. Bắt lỗi RIÊNG khâu lấy link thanh toán —
        // gộp chung với createOrder ở catch ngoài thì khách thấy "thất bại", bấm
        // lại, và lần này POST /orders báo "Giỏ hàng đang trống" vì giỏ đã sạch
        // từ lần bấm trước → kẹt hẳn, không đặt được mà cũng không trả được tiền.
        let paymentUrl: string;
        try {
          ({ paymentUrl } = await getVnpayUrl(order._id));
        } catch (err) {
          // Đơn vẫn còn nguyên (pending / chưa thanh toán) → đẩy khách sang trang
          // đơn hàng để bấm "Thanh toán lại", thay vì kẹt ở trang này.
          await refresh(); // giỏ đã bị clear ở backend → đồng bộ lại badge
          const ly = err instanceof Error ? err.message : "lỗi không rõ";
          showToast(
            `Đơn hàng đã được tạo nhưng chưa lấy được link thanh toán (${ly}).\n` +
              `Bạn vào "Đơn hàng của tôi" bấm "Thanh toán lại" để trả tiền nhé.`,
            "error",
          );
          router.replace("/don-hang");
          return; // không set busy=false — đang chuyển trang
        }

        await refresh(); // đồng bộ giỏ trước khi rời trang
        window.location.href = paymentUrl; // điều hướng sang cổng thanh toán
        return; // không set busy=false — đang chuyển trang
      }

      // ── COD: truyền Order sang trang success qua sessionStorage ──
      try {
        sessionStorage.setItem(ORDER_SUCCESS_KEY, JSON.stringify(order));
      } catch {
        /* sessionStorage có thể không khả dụng — trang success có fallback */
      }
      await refresh(); // đồng bộ giỏ (backend đã clear) → badge về 0
      router.replace("/dat-hang-thanh-cong");
    } catch (err) {
      // Tới được đây là createOrder THẤT BẠI → đơn chưa tạo, giỏ còn nguyên,
      // bấm lại được. Khác hẳn ca lỗi link thanh toán ở trên.
      const msg = err instanceof Error ? err.message : "Đặt hàng thất bại";
      setError(msg); // giữ chữ đỏ tại chỗ để khách còn thấy khi cuộn lại form
      showToast(msg, "error");
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
              <div className="-mx-5 -mt-5 mb-4 flex items-center justify-between rounded-t-2xl bg-[#007e42] px-5 py-3">
                <h2 className="flex items-center gap-2 text-base font-bold text-white">
                  <span className="text-white">
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
                    className="text-sm font-semibold text-white hover:underline"
                  >
                    {mode === "select" ? "+ Thêm địa chỉ mới" : "Chọn từ sổ"}
                  </button>
                )}
              </div>

              {/* Vị trí xuất hàng cố định của shop — cho người dùng biết giao từ đâu */}
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-gray-300 bg-gray-200 px-3.5 py-2.5">
                <span className="mt-0.5 shrink-0 text-[#007e42]">
                  <ITruck />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-gray-700">
                    Giao hàng từ {SHOP_LOCATION.name}
                  </p>
                  <p className="text-gray-500">{SHOP_LOCATION.address}</p>
                </div>
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
                  onResolve={(detail, pickedText) => {
                    setPlaceDetail(detail);
                    setPickedAddress(pickedText);
                  }}
                />
              )}

              {/* Thông tin giao hàng — hiện khi đã chọn/nhập xong địa chỉ.
                  KHÔNG còn đòi `hasGeo` như trước: địa chỉ trong sổ lưu từ trước
                  khi có tính năng toạ độ thì lat/lon = null, mà đòi hasGeo thì cả
                  khối này biến mất — khách không thấy quãng đường lẫn phí ship,
                  tưởng trang bị lỗi. Giờ vẫn hiện, chỉ đổi nội dung theo việc có
                  toạ độ hay không. */}
              {(selectedId || placeDetail) && (
                <div
                  className={`mt-3 rounded-xl border-2 px-4 py-3.5 text-sm text-gray-700 shadow-sm ${
                    hasGeo
                      ? "border-[#007e42]/40 bg-[#007e42]/10"
                      : "border-amber-400/60 bg-amber-50"
                  }`}
                >
                  {hasGeo ? (
                    <p className="mb-1.5 flex items-center gap-1.5 font-bold text-[#007e42]">
                      <ICheck />
                      Đã xác định vị trí giao hàng
                    </p>
                  ) : (
                    <p className="mb-1.5 font-bold text-amber-700">
                      Địa chỉ này chưa có toạ độ
                    </p>
                  )}

                  {geoArea && (
                    <p className="font-medium text-gray-700">{geoArea}</p>
                  )}

                  {distanceKm != null ? (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 shadow-sm ring-1 ring-gray-200">
                        <ITruck />
                        {/* 'route' = quãng đường xe chạy thật (gogoduk) → nói
                            "quãng đường" và bỏ dấu ~. 'haversine' = dự phòng
                            đường chim bay → giữ ~ và nói rõ là đường chim bay,
                            không để khách tưởng đó là số km xe sẽ chạy. */}
                        {shippingInfo.source === "route"
                          ? `Quãng đường ${distanceKm.toFixed(1)} km`
                          : `Cách kho ~${distanceKm.toFixed(1)} km đường chim bay`}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#007e42] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                        {feeLoading
                          ? "Đang tính phí ship..."
                          : `Phí ship: ${fmt(shipping)}`}
                      </span>
                    </div>
                  ) : (
                    // Không có toạ độ → không đo được quãng đường, phí về mức cơ
                    // bản. Nói rõ cách sửa: chọn lại địa chỉ từ gợi ý để lấy toạ độ.
                    <div className="mt-2.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#007e42] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                        {feeLoading
                          ? "Đang tính phí ship..."
                          : `Phí ship tạm tính: ${fmt(shipping)}`}
                      </span>
                      <p className="mt-2 text-xs leading-relaxed text-amber-800">
                        Chưa tính được quãng đường nên đang lấy phí cơ bản. Bạn
                        chọn lại địa chỉ từ danh sách gợi ý (nhập rồi bấm vào một
                        dòng hiện ra) để tính phí đúng theo quãng đường nhé.
                      </p>
                    </div>
                  )}

                  {/* Cảnh báo đơn ở xa — báo TRƯỚC khi khách bấm đặt hàng, chứ
                      không để họ tự phát hiện phí ship gấp mấy lần bình thường
                      ở dòng tổng tiền. `isFar` do backend quyết định theo cùng
                      bảng giá nó dùng để chốt phí. */}
                  {shippingInfo.isFar && !feeLoading && (
                    <p className="mt-2.5 rounded-lg bg-amber-100 px-3 py-2 text-xs leading-relaxed font-medium text-amber-900">
                      Địa chỉ này cách kho hơn 50 km nên phí vận chuyển cao hơn
                      bình thường. Bạn cân nhắc trước khi đặt nhé.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Phương thức thanh toán (UI-only) */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
              <h2 className="-mx-5 -mt-5 mb-4 bg-[#007e42] px-5 py-3 text-base font-bold text-white">
                Phương thức thanh toán
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {PAY_METHODS.map((m) => {
                  const checked = payMethod === m.id;
                  const disabled = false; // COD + VNPay đều khả dụng
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => setPayMethod(m.id)}
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                        checked
                          ? "border-[#007e42] bg-[#007e42]/10 shadow-sm"
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
            <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-[#007e42]/15 bg-white p-5 shadow-lg">
              <div className="-mx-5 -mt-5 flex items-center justify-between bg-[#007e42] px-5 py-3">
                <h2 className="text-base font-bold text-white">
                  Sản Phẩm Của Bạn
                </h2>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {items.reduce((n, i) => n + i.quantity, 0)} món
                </span>
              </div>

              {/* Danh sách item */}
              <div className="flex max-h-64 flex-col gap-3 overflow-y-auto border-b border-gray-300 pb-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : null}
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#007e42] px-1 text-[10px] font-bold text-white shadow">
                        {item.quantity}
                      </span>
                    </div>
                    <p className="line-clamp-2 min-w-0 flex-1 text-sm font-medium text-gray-700">
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
                  <span className="font-medium text-gray-800">
                    {fmt(shipping)}
                  </span>
                </div>
              </div>

              {/* Ghi chú */}
              <div className="flex flex-col gap-1 border-t border-gray-300 pt-3">
                <label className="text-xs font-semibold text-gray-600">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Ví dụ: Giao giờ hành chính..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]/20"
                />
              </div>

              {/* Tổng */}
              <div className="flex items-center justify-between rounded-xl border border-gray-300 bg-gray-200 px-4 py-3">
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
