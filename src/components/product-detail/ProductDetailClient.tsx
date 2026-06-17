"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import { fmt } from "@/lib/format";
import { Stars } from "@/components/Stars";
import { BADGE_STYLES, ICartPush, IHome, ILeaf, ITruck, IShieldCheck, IRefresh } from "@/components/icons";
import { ProductCard } from "@/components/home/ProductItem";
import { fetchProducts } from "@/services/products";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

/* ── Fake data (demo trình bày — luôn hiển thị) ── */
const FAKE_DESCRIPTION = `Sản phẩm vật tư nông nghiệp chất lượng cao, được tuyển chọn kỹ lưỡng nhằm hỗ trợ cây trồng phát triển khỏe mạnh qua từng giai đoạn sinh trưởng. Công thức cân đối giúp tăng sức đề kháng, cải thiện năng suất và chất lượng nông sản.

Phù hợp với nhiều loại cây trồng phổ biến như lúa, rau màu, cây ăn trái và cây công nghiệp. Sản phẩm thân thiện với môi trường, an toàn cho người sử dụng khi tuân thủ đúng hướng dẫn.`;

const FAKE_HIGHLIGHTS = [
  "Thành phần dinh dưỡng cân đối, dễ hấp thu",
  "Giúp cây sinh trưởng nhanh, tăng năng suất",
  "An toàn cho cây trồng và thân thiện môi trường",
  "Bảo quản dễ dàng, hạn sử dụng dài",
];

const FAKE_SPECS: { label: string; value: string }[] = [
  { label: "Xuất xứ", value: "Việt Nam" },
  { label: "Quy cách", value: "Bao 5kg / 10kg / 25kg" },
  { label: "Dạng", value: "Hạt / Bột hòa tan" },
  { label: "Bảo quản", value: "Nơi khô ráo, thoáng mát" },
];

const FAKE_USAGE_STEPS = [
  "Đọc kỹ hướng dẫn và xác định liều lượng phù hợp với loại cây trồng.",
  "Pha hoặc rải theo tỷ lệ khuyến cáo, tránh dùng quá liều.",
  "Áp dụng vào sáng sớm hoặc chiều mát để đạt hiệu quả tốt nhất.",
  "Tưới nước đầy đủ sau khi bón để dưỡng chất thấm đều vào đất.",
];

const FAKE_NOTES = [
  "Đeo găng tay và khẩu trang khi sử dụng.",
  "Để xa tầm tay trẻ em và vật nuôi.",
  "Không sử dụng khi trời sắp mưa lớn.",
];

type Tab = "mo-ta" | "huong-dan" | "thong-so";

const TABS: { value: Tab; label: string }[] = [
  { value: "mo-ta", label: "Mô tả sản phẩm" },
  { value: "huong-dan", label: "Hướng dẫn sử dụng" },
  { value: "thong-so", label: "Thông số kỹ thuật" },
];

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("mo-ta");
  const [carted, setCarted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [cartError, setCartError] = useState("");
  const [related, setRelated] = useState<Product[]>([]);

  const images = product.images ?? [];
  // Demo trình bày: luôn hiện tối thiểu 4 ô thumbnail (ô đầu là ảnh thật, còn lại placeholder)
  const thumbCount = Math.max(images.length, 4);
  const outOfStock = product.stock === 0;
  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  // Đánh giá + đã bán (dùng data thật nếu có, không thì fake để demo trình bày)
  const ratingValue = product.rating ?? 4.8;
  const ratingCount = product.ratingCount ?? 124;
  const soldCount = 1280;

  useEffect(() => {
    if (!product.categoryId) return;
    fetchProducts({ categoryId: product.categoryId, limit: 5 })
      .then((res) => {
        setRelated(res.data.filter((p) => p._id !== product._id).slice(0, 4));
      })
      .catch(() => setRelated([]));
  }, [product._id, product.categoryId]);

  const handleAddToCart = async () => {
    if (outOfStock || adding) return;
    // Cart API cần đăng nhập → chuyển hướng nếu chưa login
    if (!user) {
      router.push("/dang-nhap");
      return;
    }
    setAdding(true);
    setCartError("");
    try {
      await addToCart(product._id, qty);
      setCarted(true);
      setTimeout(() => setCarted(false), 1500);
    } catch (err) {
      setCartError(
        err instanceof Error ? err.message : "Không thể thêm vào giỏ hàng",
      );
    } finally {
      setAdding(false);
    }
  };

  const changeQty = (delta: number) => {
    setQty((q) => Math.max(1, Math.min(product.stock, q + delta)));
  };

  const commitQty = (raw: string) => {
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return setQty(1);
    setQty(Math.max(1, Math.min(product.stock, n)));
  };

  return (
    <section className="relative min-h-screen w-full bg-[#e5e7eb] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
          <Link href="/" className="flex items-center gap-1 hover:text-[#007e42]">
            <IHome />
            <span>Trang chủ</span>
          </Link>
          <span className="text-gray-300">/</span>
          <Link href="/" className="hover:text-[#007e42]">Sản phẩm</Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-[#007e42] line-clamp-1 max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Main 2-col (card trắng nổi) */}
        <div className="flex flex-col gap-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:gap-12 lg:p-8">

          {/* ── CỘT TRÁI: Gallery ── */}
          <div className="w-full lg:w-1/2">
            {/* Ảnh lớn */}
            <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-2xl bg-white sm:h-96 lg:h-110">
              {images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[activeImage].url}
                  alt={product.name}
                  className="relative z-[1] h-full w-full object-contain p-4"
                />
              ) : (
                <ILeaf size={80} />
              )}
              {/* Badge */}
              {product.badge && (
                <span className={`absolute left-3 top-3 z-10 rounded-lg px-2.5 py-1 text-xs font-bold uppercase text-white shadow ${BADGE_STYLES[product.badge]}`}>
                  {product.badge}
                </span>
              )}
              {discountPct > 0 && (
                <span className="absolute right-3 top-3 z-10 rounded-lg bg-[#007e42] px-2.5 py-1 text-xs font-bold text-white shadow">
                  -{discountPct}%
                </span>
              )}
            </div>

            {/* Thumbnails — luôn hiển thị; nếu chưa có ảnh thật thì dùng ô placeholder để xem layout */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {Array.from({ length: thumbCount }).map((_, i) => {
                const img = images[i];
                return (
                  <button
                    key={img?.publicId ?? `placeholder-${i}`}
                    onClick={() => setActiveImage(i)}
                    className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-emerald-50/40 transition ${
                      i === activeImage
                        ? "border-[#007e42] shadow-md"
                        : "border-gray-200 hover:border-[#007e42]/50"
                    }`}
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img.url} alt={`${product.name} ${i + 1}`} className="h-full w-full object-contain p-1.5" />
                    ) : (
                      <ILeaf size={28} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── CỘT PHẢI: Info ── */}
          <div className="flex w-full flex-col gap-5 lg:w-1/2">

            {/* Tên sản phẩm */}
            <div>
              <h1 className="text-xl font-extrabold leading-snug text-gray-900 sm:text-2xl lg:text-3xl">
                {product.name}
              </h1>
            </div>

            {/* Đánh giá + Đã bán */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-500">{ratingValue.toFixed(1)}</span>
                <Stars rating={ratingValue} />
              </div>
              <span className="h-4 w-px bg-gray-200" />
              <span className="text-gray-500">
                <span className="font-semibold text-gray-700">{ratingCount}</span> đánh giá
              </span>
              <span className="h-4 w-px bg-gray-200" />
              <span className="text-gray-500">
                Đã bán <span className="font-semibold text-gray-700">{soldCount.toLocaleString("vi-VN")}</span>
              </span>
            </div>

            <hr className="border-gray-100" />

            {/* Giá */}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[#007e42]">{fmt(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-400 line-through">{fmt(product.originalPrice)}</span>
              )}
              {discountPct > 0 && (
                <span className="rounded-lg bg-[#007e42]/10 px-2.5 py-1 text-sm font-bold text-[#007e42]">
                  Tiết kiệm {discountPct}%
                </span>
              )}
            </div>

            {/* Tồn kho */}
            <p className="text-sm">
              {outOfStock ? (
                <span className="font-semibold text-red-500">Hết hàng</span>
              ) : (
                <>
                  Tình trạng:{" "}
                  <span className="font-semibold text-[#007e42]">
                    Còn {product.stock} cái
                  </span>
                </>
              )}
            </p>

            <hr className="border-gray-100" />

            {/* Nút hành động: số lượng + thêm vào giỏ cùng hàng */}
            <div className="flex gap-3">
              {/* Quantity */}
              <div className="flex items-center overflow-hidden rounded-xl border border-gray-200">
                <button
                  onClick={() => changeQty(-1)}
                  disabled={outOfStock || qty <= 1}
                  className="flex h-12 w-11 items-center justify-center text-gray-600 transition hover:bg-emerald-50 hover:text-[#007e42] disabled:opacity-40"
                >
                  −
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value.replace(/\D/g, "")) || 1)}
                  onBlur={(e) => commitQty(e.target.value)}
                  disabled={outOfStock}
                  className="h-12 w-12 border-x border-gray-200 bg-white text-center text-sm font-semibold text-gray-800 outline-none disabled:opacity-40"
                />
                <button
                  onClick={() => changeQty(1)}
                  disabled={outOfStock || qty >= product.stock}
                  className="flex h-12 w-11 items-center justify-center text-gray-600 transition hover:bg-emerald-50 hover:text-[#007e42] disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={outOfStock || adding}
                className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition disabled:opacity-60 ${
                  outOfStock
                    ? "cursor-not-allowed bg-gray-200 text-gray-400"
                    : carted
                    ? "bg-[#007e42] text-white shadow-lg"
                    : "bg-[#007e42] text-white shadow hover:bg-[#0a9d52]"
                }`}
              >
                <ICartPush />
                {outOfStock
                  ? "Hết hàng"
                  : adding
                  ? "Đang thêm..."
                  : carted
                  ? "Đã thêm!"
                  : "Thêm vào giỏ hàng"}
              </button>
            </div>

            {cartError && (
              <p className="text-sm font-medium text-red-500">{cartError}</p>
            )}

            <hr className="border-gray-100" />

            {/* Dải cam kết */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: <ITruck />, title: "Giao hàng nhanh", desc: "Nội thành 1–2 ngày" },
                { icon: <IShieldCheck />, title: "Hàng chính hãng", desc: "Cam kết 100%" },
                { icon: <IRefresh />, title: "Đổi trả dễ dàng", desc: "Trong vòng 7 ngày" },
              ].map((c) => (
                <div key={c.title} className="flex items-center gap-2.5 rounded-xl bg-emerald-50/60 px-3 py-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#007e42] shadow-sm">
                    {c.icon}
                  </span>
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-gray-800">{c.title}</p>
                    <p className="text-[11px] text-gray-500">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Mô tả / Hướng dẫn / Thông số (dạng tab) ── */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Thanh tab */}
          <div className="flex flex-wrap border-b border-gray-100">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setActiveTab(t.value)}
                className={`relative px-5 py-3.5 text-sm font-semibold transition ${
                  activeTab === t.value
                    ? "text-[#007e42]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
                {activeTab === t.value && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#007e42]" />
                )}
              </button>
            ))}
          </div>

          {/* Nội dung tab */}
          <div className="p-6">
            {/* Mô tả */}
            {activeTab === "mo-ta" && (
              <div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                  {product.description?.trim() || FAKE_DESCRIPTION}
                </p>
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {FAKE_HIGHLIGHTS.map((h) => (
                    <div key={h} className="flex items-start gap-2 rounded-xl bg-emerald-50/60 px-3 py-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#007e42] text-[11px] font-bold text-white">✓</span>
                      <span className="text-xs font-medium text-gray-700">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hướng dẫn */}
            {activeTab === "huong-dan" && (
              <div>
                {product.usageInstructions?.trim() ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                    {product.usageInstructions}
                  </p>
                ) : (
                  <ol className="flex flex-col gap-3">
                    {FAKE_USAGE_STEPS.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#007e42] text-sm font-bold text-white">
                          {i + 1}
                        </span>
                        <span className="pt-0.5 text-sm leading-relaxed text-gray-600">{step}</span>
                      </li>
                    ))}
                  </ol>
                )}

                <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-700">⚠ Lưu ý an toàn</p>
                  <ul className="flex flex-col gap-1.5">
                    {FAKE_NOTES.map((n) => (
                      <li key={n} className="flex items-start gap-2 text-xs text-amber-800">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Thông số */}
            {activeTab === "thong-so" && (
              <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                {FAKE_SPECS.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-3 border-b border-gray-100 py-2.5">
                    <dt className="text-xs font-medium text-gray-400">{s.label}</dt>
                    <dd className="text-right text-xs font-semibold text-gray-700">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        {/* ── Sản phẩm liên quan ── */}
        {related.length > 0 && (
          <div className="mt-14">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-[#007e42]" />
              <h2 className="text-lg font-extrabold uppercase text-gray-900 sm:text-xl">
                Sản phẩm liên quan
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
