"use client";

import { useEffect, useRef, useState } from "react";
import {
  suggestAddress,
  resolvePlace,
  type AddressPrediction,
  type PlaceDetail,
} from "@/services/addresses";
import type { ShippingAddressInput } from "@/services/orders";

/* ─────────────────────────────────────────
   Icons (inline SVG — đồng bộ tông xanh #007e42)
───────────────────────────────────────── */
function ISearch() {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IPin() {
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
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ISpinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Giá trị form = họ tên + sđt + 1 ô địa chỉ + cờ "lưu vào sổ". */
export interface AddressFormValues extends ShippingAddressInput {
  saveToBook: boolean;
}

export const EMPTY_ADDRESS: AddressFormValues = {
  fullName: "",
  phone: "",
  address: "",
  saveToBook: true,
};

/** Validate phía client; trả về map lỗi theo field (rỗng = hợp lệ). */
export function validateAddress(
  v: AddressFormValues,
): Partial<Record<keyof AddressFormValues, string>> {
  const errors: Partial<Record<keyof AddressFormValues, string>> = {};
  if (!v.fullName.trim()) errors.fullName = "Vui lòng nhập họ tên người nhận";
  if (!v.phone.trim()) {
    errors.phone = "Vui lòng nhập số điện thoại";
  } else if (!/^0\d{9}$/.test(v.phone.trim())) {
    errors.phone = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)";
  }
  if (!v.address.trim()) errors.address = "Vui lòng nhập/chọn địa chỉ";
  return errors;
}

function Field({
  label,
  value,
  placeholder,
  error,
  inputMode,
  maxLength,
  sanitize,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  inputMode?: "text" | "numeric";
  maxLength?: number;
  /** Lọc/chuẩn hoá giá trị trước khi phát onChange (vd: chỉ giữ chữ số). */
  sanitize?: (v: string) => string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input
        type="text"
        inputMode={inputMode}
        maxLength={maxLength}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(sanitize ? sanitize(e.target.value) : e.target.value)
        }
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
          error
            ? "border-red-300 bg-red-50"
            : "border-gray-200 focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]/20"
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────
   Ô địa chỉ có gợi ý (autocomplete gogoduk)
───────────────────────────────────────── */
function AddressAutocomplete({
  value,
  error,
  onChange,
  onResolve,
}: {
  value: string;
  error?: string;
  onChange: (v: string) => void;
  /** Gọi sau khi resolve placeId → trả địa chỉ chi tiết (lat/lon/quận/thành phố). */
  onResolve?: (detail: PlaceDetail | null) => void;
}) {
  const [predictions, setPredictions] = useState<AddressPrediction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  // Tăng mỗi lần gọi để bỏ kết quả của request cũ về sau (race condition).
  const reqId = useRef(0);
  // Khi user vừa chọn 1 gợi ý, không gọi search lại cho lần value đó.
  const justPicked = useRef(false);

  // Debounce gọi suggestAddress mỗi khi value đổi (do user gõ).
  useEffect(() => {
    if (justPicked.current) {
      justPicked.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 2) {
      setPredictions([]);
      setOpen(false);
      return;
    }
    const myId = ++reqId.current;
    setLoading(true);
    const t = setTimeout(() => {
      suggestAddress(q)
        .then((res) => {
          if (myId !== reqId.current) return; // kết quả cũ → bỏ
          setPredictions(res.predictions);
          setOpen(res.predictions.length > 0);
        })
        .catch(() => {
          if (myId !== reqId.current) return;
          setPredictions([]);
          setOpen(false);
        })
        .finally(() => {
          if (myId === reqId.current) setLoading(false);
        });
    }, 300);
    return () => clearTimeout(t);
  }, [value]);

  // Đóng dropdown khi click ra ngoài.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pick(p: AddressPrediction) {
    justPicked.current = true;
    onChange(p.text);
    setOpen(false);
    setPredictions([]);
    // Lấy địa chỉ chi tiết (lat/lon/quận/thành phố) từ placeId vừa chọn.
    if (onResolve) {
      setResolving(true);
      resolvePlace(p.placeId)
        .then((detail) => onResolve(detail))
        .catch(() => onResolve(null))
        .finally(() => setResolving(false));
    }
  }

  return (
    <div className="relative flex flex-col gap-1" ref={boxRef}>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
        Địa chỉ giao hàng
        <span className="inline-flex items-center gap-1 rounded-full bg-[#007e42]/10 px-2 py-0.5 text-[10px] font-medium text-[#007e42]">
          <ISearch />
          Tìm kiếm thông minh
        </span>
      </label>

      <div className="relative">
        {/* Icon ghim địa chỉ bên trái — báo hiệu ô nhập địa chỉ */}
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#007e42]">
          <IPin />
        </span>

        <input
          type="text"
          value={value}
          placeholder="Gõ tên đường, số nhà... rồi chọn từ gợi ý"
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => predictions.length > 0 && setOpen(true)}
          className={`w-full rounded-lg border py-2 pl-9 pr-9 text-sm outline-none transition ${
            error
              ? "border-red-300 bg-red-50"
              : "border-gray-200 focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]/20"
          }`}
        />

        {/* Spinner bên phải khi đang tìm / đang lấy chi tiết */}
        {(loading || resolving) && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#007e42]">
            <ISpinner />
          </span>
        )}
      </div>

      {/* Hint giúp người dùng hiểu cách dùng */}
      {!error && (
        <p className="text-[11px] text-gray-400">
          Gõ để tìm địa chỉ, chọn từ danh sách gợi ý (có thể chỉnh lại sau khi
          chọn).
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}

      {open && (
        <ul className="absolute top-full z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {loading && (
            <li className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400">
              <ISpinner />
              Đang tìm...
            </li>
          )}
          {predictions.map((p) => (
            <li key={p.placeId}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(p)}
                className="flex w-full items-start gap-2.5 px-3 py-2 text-left transition hover:bg-[#007e42]/5"
              >
                <span className="mt-0.5 shrink-0 text-[#007e42]">
                  <IPin />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium text-gray-800">
                    {p.mainText}
                  </span>
                  <span className="text-xs text-gray-500">
                    {p.secondaryText}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Form nhập địa chỉ — controlled bởi component cha (CheckoutPage).
 * Cha giữ state `values`/`errors`; form chỉ render và phát onChange.
 * `showSave`: chỉ hiện checkbox "lưu vào sổ" khi user đã đăng nhập.
 */
export default function AddressForm({
  values,
  errors,
  showSave,
  onChange,
  onResolve,
}: {
  values: AddressFormValues;
  errors: Partial<Record<keyof AddressFormValues, string>>;
  showSave: boolean;
  onChange: (next: AddressFormValues) => void;
  /** Nhận địa chỉ chi tiết (lat/lon/quận/thành phố) khi user chọn 1 gợi ý. */
  onResolve?: (detail: PlaceDetail | null) => void;
}) {
  function set<K extends keyof AddressFormValues>(
    key: K,
    val: AddressFormValues[K],
  ) {
    onChange({ ...values, [key]: val });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Họ tên người nhận"
          value={values.fullName}
          placeholder="Nguyễn Văn A"
          error={errors.fullName}
          onChange={(v) => set("fullName", v)}
        />
        <Field
          label="Số điện thoại"
          value={values.phone}
          placeholder="0901234567"
          error={errors.phone}
          inputMode="numeric"
          maxLength={10}
          sanitize={(v) => v.replace(/\D/g, "").slice(0, 10)}
          onChange={(v) => set("phone", v)}
        />
      </div>

      <AddressAutocomplete
        value={values.address}
        error={errors.address}
        onChange={(v) => set("address", v)}
        onResolve={onResolve}
      />

      {showSave && (
        <label className="mt-1 flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={values.saveToBook}
            onChange={(e) => set("saveToBook", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-[#007e42]"
          />
          Lưu địa chỉ này vào sổ địa chỉ
        </label>
      )}
    </div>
  );
}
