"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { predictDisease } from "@/services/diseases";
import { getProduct } from "@/services/products";
import type { DiseasePrediction, PredictResult } from "@/types/disease";
import type { Product } from "@/types/product";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB — khớp giới hạn ml-service
const ACCEPTED = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

/** Ảnh minh họa local theo slug bệnh (đặt trong /public) — đồng bộ trang Cẩm nang bệnh. */
const DISEASE_IMAGE_BY_SLUG: Record<string, string> = {
  "dao-on-la": "/dao-on-lua.png",
  "dao-on-co-bong": "/dao_on_co_bong.png",
  "bac-la-chay-bia-la": "/chay_bia_la.jpg",
  "lem-lep-hat": "/lem_lep_hat.jpg",
  "vang-lun-lun-xoan-la": "/benh_vang_lun.jpg",
  "dom-nau": "/dom-nau-tren-lua.jpg",
  "khoe-manh": "/la_lua_khoe_manh.png",
};

/** Ảnh minh họa cho 1 dự đoán: ưu tiên ảnh DB (Cloudinary) → ảnh local theo slug → fallback. */
function imageForPrediction(p: DiseasePrediction): string {
  return p.disease?.images?.[0]?.url || DISEASE_IMAGE_BY_SLUG[p.class] || "/la_lua.png";
}

/** Tên tiếng Anh của bệnh theo slug — hiển thị phụ dưới tên tiếng Việt. */
const DISEASE_ENGLISH_NAME: Record<string, string> = {
  "dao-on-la": "Rice Blast",
  "dao-on-co-bong": "Neck Blast",
  "bac-la-chay-bia-la": "Bacterial Leaf Blight",
  "lem-lep-hat": "Dirty Panicle / Grain Discoloration",
  "vang-lun-lun-xoan-la": "Rice Grassy Stunt / Ragged Stunt",
  "dom-nau": "Brown Spot",
  "khoe-manh": "Healthy",
};

/** Tác nhân gây bệnh theo slug. */
const DISEASE_CAUSE: Record<string, string> = {
  "dao-on-la": "Nấm Pyricularia oryzae",
  "dao-on-co-bong": "Nấm Pyricularia oryzae",
  "bac-la-chay-bia-la": "Vi khuẩn Xanthomonas oryzae",
  "lem-lep-hat": "Nấm và vi khuẩn (Bipolaris, Curvularia...)",
  "vang-lun-lun-xoan-la": "Virus (rầy nâu truyền bệnh)",
  "dom-nau": "Nấm Bipolaris oryzae",
  "khoe-manh": "",
};

/** Định dạng confidence 0..1 thành phần trăm gọn (vd 0.9412 -> "94%"). */
function pct(conf: number): string {
  return `${Math.round(conf * 100)}%`;
}

/** Màu theo mức độ tin cậy: cao=xanh lá, trung bình=vàng, thấp=đỏ. */
function confidenceColors(conf: number): { bar: string; text: string } {
  if (conf >= 0.7) return { bar: "bg-[#007e42]", text: "text-[#007e42]" };
  if (conf >= 0.4) return { bar: "bg-amber-500", text: "text-amber-600" };
  return { bar: "bg-red-500", text: "text-red-600" };
}

/** Tiêu đề khối dạng thanh ngang xanh (đồng bộ với trang Cẩm nang bệnh). */
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-t-2xl bg-[#007e42] px-5 py-3 sm:px-6">
      <h2 className="text-base font-extrabold text-white sm:text-lg">{children}</h2>
    </div>
  );
}

export default function ChanDoanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Bệnh đang được mở chi tiết trong modal (null = đóng).
  const [detail, setDetail] = useState<DiseasePrediction | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Dọn object URL khi đổi ảnh / unmount để khỏi rò bộ nhớ ── */
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* ── Nhận file (từ input hoặc kéo thả), validate trước khi nhận ── */
  const acceptFile = useCallback(
    (f: File | undefined | null) => {
      if (!f) return;
      if (!ACCEPTED.includes(f.type)) {
        setError("Vui lòng chọn ảnh JPG, PNG hoặc WEBP.");
        return;
      }
      if (f.size > MAX_FILE_BYTES) {
        setError("Ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.");
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setError(null);
      setResult(null);
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    },
    [previewUrl],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  /* ── Gọi API dự đoán ── */
  const handlePredict = async () => {
    if (!file) return;
    try {
      setLoading(true);
      setError(null);
      const res = await predictDisease(file);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Dự đoán thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#e5e7eb] font-sans text-gray-800">
      <div className="mx-auto max-w-360 px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        {/* Breadcrumb */}
        <nav className="mb-3 flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <Link href="/" className="hover:text-[#007e42]">Trang chủ</Link>
          <span>/</span>
          <span className="text-gray-700">Chẩn đoán bệnh qua ảnh</span>
        </nav>
        <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">
          Chẩn đoán bệnh lúa qua ảnh
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-[15px]">
          Tải lên ảnh lá lúa, hệ thống sẽ tự động nhận diện bệnh và gợi ý thuốc đặc trị.
          Để kết quả chính xác, hãy chụp rõ vùng lá bị bệnh, đủ sáng và không bị mờ.
        </p>
      </div>

      <div className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* ── Cột trái: Upload ── */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-5">
            <SectionHeader>Ảnh lá lúa cần chẩn đoán</SectionHeader>
            <div className="p-5 sm:p-6">
              {/* Vùng kéo thả / chọn ảnh */}
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`flex min-h-88 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition sm:min-h-104 ${
                  dragOver
                    ? "border-[#007e42] bg-emerald-50"
                    : "border-gray-300 bg-gray-50 hover:border-[#007e42] hover:bg-emerald-50/50"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED.join(",")}
                  className="hidden"
                  onChange={(e) => acceptFile(e.target.files?.[0])}
                />

                {previewUrl ? (
                  <div className="relative h-80 w-full overflow-hidden rounded-lg sm:h-96">
                    {/* Ảnh xem trước là blob: URL — next/image không hỗ trợ, dùng <img>. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Ảnh xem trước"
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-[#007e42]" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-sm font-bold text-gray-700">
                      Kéo thả ảnh vào đây hoặc <span className="text-[#007e42]">bấm để chọn</span>
                    </p>
                    <p className="mt-1 text-xs text-gray-400">JPG, PNG, WEBP — tối đa 5MB</p>
                  </>
                )}
              </label>

              {error && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  {error}
                </p>
              )}

              {/* Nút hành động */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handlePredict}
                  disabled={!file || loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#007e42] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#006835] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Đang phân tích...
                    </>
                  ) : (
                    "Chẩn đoán bệnh"
                  )}
                </button>
                {file && (
                  <button
                    onClick={handleReset}
                    disabled={loading}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Chọn ảnh khác
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ── Cột phải: Kết quả ── */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-7">
            <SectionHeader>Kết quả chẩn đoán</SectionHeader>
            <div className="bg-[#e5e7eb] p-5 sm:p-6">
              {!result && !loading && (
                <div className="flex h-72 flex-col items-center justify-center gap-2 text-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <p className="text-sm">Kết quả sẽ hiển thị ở đây sau khi bạn tải ảnh và bấm chẩn đoán.</p>
                </div>
              )}

              {loading && (
                <div className="space-y-3">
                  <div className="h-24 animate-pulse rounded-xl bg-white shadow-sm" />
                  <div className="h-24 animate-pulse rounded-xl bg-white shadow-sm" />
                  <div className="h-24 animate-pulse rounded-xl bg-white shadow-sm" />
                </div>
              )}

              {result && !loading && (
                <div className="space-y-3">
                  {result.predictions.map((p, i) => (
                    <ResultCard
                      key={p.class}
                      prediction={p}
                      rank={i}
                      onDetail={() => setDetail(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Ghi chú */}
        <p className="mt-6 text-center text-xs italic text-gray-400">
          * Kết quả mang tính tham khảo, dựa trên mô hình AI. Với trường hợp nghiêm trọng,
          vui lòng tham vấn cán bộ kỹ thuật nông nghiệp.
        </p>
      </div>

      {/* Modal chi tiết bệnh */}
      {detail && <DetailModal prediction={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

/* ───────── Card 1 bệnh trong danh sách kết quả ───────── */
function ResultCard({
  prediction,
  rank,
  onDetail,
}: {
  prediction: DiseasePrediction;
  rank: number;
  onDetail: () => void;
}) {
  const isTop = rank === 0;
  const hasDetail = !!prediction.disease;
  const colors = confidenceColors(prediction.confidence);

  return (
    <div
      className={`flex gap-4 rounded-xl border bg-white p-4 shadow-sm transition ${
        isTop ? "border-2 border-amber-400" : "border-gray-200"
      }`}
    >
      {/* Ảnh minh họa bệnh */}
      <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-linear-to-br from-[#ebf5ef] to-[#cce8d9] sm:h-36 sm:w-36">
        <Image
          src={imageForPrediction(prediction)}
          alt={prediction.label}
          fill
          sizes="144px"
          className="object-cover"
        />
      </div>

      {/* Nội dung */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {isTop && (
              <span className="mb-1 inline-block rounded-full bg-[#007e42] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                Khả năng cao nhất
              </span>
            )}
            <h3 className="text-base font-extrabold text-gray-900">{prediction.label}</h3>
            {DISEASE_ENGLISH_NAME[prediction.class] && (
              <p className="mt-1 text-xs text-gray-600">
                <span className="font-semibold text-gray-500">Tên tiếng Anh: </span>
                {DISEASE_ENGLISH_NAME[prediction.class]}
              </p>
            )}
            {DISEASE_CAUSE[prediction.class] && (
              <p className="mt-1 text-xs text-gray-600">
                <span className="font-semibold text-gray-500">Tác nhân: </span>
                {DISEASE_CAUSE[prediction.class]}
              </p>
            )}
          </div>
          <span className={`shrink-0 text-lg font-black ${colors.text}`}>
            {pct(prediction.confidence)}
          </span>
        </div>

        {/* Thanh độ tin cậy */}
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all ${colors.bar}`}
            style={{ width: pct(prediction.confidence) }}
          />
        </div>

        {/* Hành động */}
        <div className="mt-3">
          {hasDetail ? (
            <button
              onClick={onDetail}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#007e42] hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Xem chi tiết &amp; thuốc gợi ý
            </button>
          ) : (
            <p className="text-xs italic text-gray-400">
              Không có dữ liệu bệnh tương ứng (có thể là lá khỏe).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────── Modal chi tiết bệnh + thuốc gợi ý ───────── */
function DetailModal({
  prediction,
  onClose,
}: {
  prediction: DiseasePrediction;
  onClose: () => void;
}) {
  const disease = prediction.disease!; // chỉ mở modal khi có disease
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  /* Tải thuốc gợi ý của bệnh này khi mở modal */
  useEffect(() => {
    const ids = disease.recommendedProductIds ?? [];
    let cancelled = false;
    (async () => {
      if (ids.length === 0) {
        if (!cancelled) {
          setProducts([]);
          setLoadingProducts(false);
        }
        return;
      }
      const settled = await Promise.allSettled(ids.map((id) => getProduct(id)));
      if (cancelled) return;
      setProducts(
        settled
          .filter((r): r is PromiseFulfilledResult<Product> => r.status === "fulfilled")
          .map((r) => r.value),
      );
      setLoadingProducts(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [disease]);

  /* Đóng modal bằng phím Esc + khóa scroll nền */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header xanh */}
        <div className="flex items-center justify-between gap-3 bg-[#007e42] px-5 py-3 sm:px-6">
          <h3 className="text-base font-extrabold text-white sm:text-lg">{disease.name}</h3>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nội dung cuộn được — nền xám, các khối trắng nổi lên */}
        <div className="max-h-[calc(90vh-3.5rem)] space-y-4 overflow-y-auto bg-[#e5e7eb] p-5 sm:p-6">
          {/* Độ tin cậy */}
          <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 text-sm shadow-sm">
            <span className="font-medium text-gray-500">Độ tin cậy nhận diện:</span>
            <span className="font-black text-[#007e42]">{pct(prediction.confidence)}</span>
          </div>

          {/* Ảnh minh họa nếu có */}
          {disease.images?.[0]?.url && (
            <div className="relative h-56 w-full overflow-hidden rounded-xl border border-gray-100 shadow-sm">
              <Image
                src={disease.images[0].url}
                alt={disease.name}
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover"
              />
            </div>
          )}

          {/* Mô tả */}
          {disease.description && (
            <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <h4 className="mb-1.5 flex items-center gap-2 text-sm font-bold text-gray-900">
                <span className="h-4 w-1 rounded-full bg-[#007e42]" />
                Mô tả &amp; nguyên nhân
              </h4>
              <p className="text-sm leading-6 text-gray-700">{disease.description}</p>
            </section>
          )}

          {/* Triệu chứng */}
          {disease.symptoms.length > 0 && (
            <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
                <span className="h-4 w-1 rounded-full bg-[#007e42]" />
                Triệu chứng nhận biết
              </h4>
              <ul className="space-y-1.5">
                {disease.symptoms.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm leading-6 text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" className="mt-1 shrink-0 text-[#007e42]" viewBox="0 0 16 16">
                      <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
                    </svg>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Thuốc gợi ý */}
          <section className="rounded-xl border border-gray-200 bg-[#e5e7eb] p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#007e42]">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
              </svg>
              Thuốc đặc trị gợi ý
            </h4>

            {loadingProducts ? (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-44 w-36 shrink-0 animate-pulse rounded-xl bg-white" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="text-xs italic text-gray-400">Chưa có thuốc gợi ý cho bệnh này.</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {products.map((p) => (
                  <Link
                    key={p._id}
                    href={`/san-pham/${p._id}`}
                    className="group flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border border-transparent bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-square w-full bg-white">
                      <Image
                        src={p.images?.[0]?.url || "/thuoc.png"}
                        alt={p.name}
                        fill
                        sizes="144px"
                        className="object-contain p-3 drop-shadow-md transition duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-3">
                      <p className="line-clamp-2 text-[13px] font-bold leading-snug text-gray-800 transition group-hover:text-[#007e42]">
                        {p.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
