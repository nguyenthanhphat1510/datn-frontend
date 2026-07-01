"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product, Review } from "@/types/product";
import { fmt } from "@/lib/format";
import { Stars } from "@/components/Stars";
import { BADGE_STYLES, ICartPush, IHome, ILeaf, ITruck, IShieldCheck, IRefresh } from "@/components/icons";
import { ProductCard } from "@/components/home/ProductItem";
import { fetchProducts, getProduct } from "@/services/products";
import { getProductReviews } from "@/services/reviews";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

type Tab = "mo-ta" | "huong-dan" | "thanh-phan";

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  // Chỉ hiển thị tab có dữ liệu thật (mô tả luôn có; hướng dẫn / thành phần tùy SP).
  const tabs: { value: Tab; label: string }[] = [
    { value: "mo-ta", label: "Mô tả sản phẩm" },
    ...(product.usageInstructions?.trim()
      ? [{ value: "huong-dan" as Tab, label: "Hướng dẫn sử dụng" }]
      : []),
    ...(product.ingredients?.trim()
      ? [{ value: "thanh-phan" as Tab, label: "Thành phần" }]
      : []),
  ];
  const [activeTab, setActiveTab] = useState<Tab>("mo-ta");
  const [carted, setCarted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [cartError, setCartError] = useState("");
  const [related, setRelated] = useState<Product[]>([]);

  // Đánh giá: danh sách review + rating cập nhật real-time sau khi gửi
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState({
    average: product.averageRating ?? 0,
    count: product.reviewCount ?? 0,
  });

  // Tải danh sách review + làm mới rating từ backend
  const loadReviews = useCallback(() => {
    getProductReviews(product._id, { limit: 50 })
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]));
    // Lấy lại product để cập nhật averageRating/reviewCount sau khi recalc
    getProduct(product._id)
      .then((p) =>
        setRating({
          average: p.averageRating ?? 0,
          count: p.reviewCount ?? 0,
        }),
      )
      .catch(() => {});
  }, [product._id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const images = product.images ?? [];
  const outOfStock = product.stock === 0;
  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  // Đánh giá thật từ backend (0 nếu chưa có review nào)
  const ratingValue = rating.average;
  const ratingCount = rating.count;

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

            {/* Thumbnails — chỉ hiển thị khi có nhiều hơn 1 ảnh thật */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.publicId}
                    onClick={() => setActiveImage(i)}
                    className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-emerald-50/40 transition ${
                      i === activeImage
                        ? "border-[#007e42] shadow-md"
                        : "border-gray-200 hover:border-[#007e42]/50"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={`${product.name} ${i + 1}`} className="h-full w-full object-contain p-1.5" />
                  </button>
                ))}
              </div>
            )}
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
            </div>

            <hr className="border-gray-300" />

            {/* Giá */}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[#007e42]">{fmt(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-400 line-through">{fmt(product.originalPrice)}</span>
              )}
              {discountPct > 0 && (
                <span className="rounded-lg bg-[#007e42]/20 px-2.5 py-1 text-sm font-bold text-[#007e42]">
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

            <hr className="border-gray-300" />

            {/* Nút hành động: số lượng + thêm vào giỏ cùng hàng */}
            <div className="flex gap-3">
              {/* Quantity */}
              <div className="flex items-center overflow-hidden rounded-xl border border-gray-300">
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
                  className="h-12 w-12 border-x border-gray-300 bg-white text-center text-sm font-semibold text-gray-800 outline-none disabled:opacity-40"
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

            <hr className="border-gray-300" />

            {/* Dải cam kết */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: <ITruck />, title: "Giao hàng nhanh", desc: "Nội thành 1–2 ngày" },
                { icon: <IShieldCheck />, title: "Hàng chính hãng", desc: "Cam kết 100%" },
                { icon: <IRefresh />, title: "Đổi trả dễ dàng", desc: "Trong vòng 7 ngày" },
              ].map((c) => (
                <div key={c.title} className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-100 px-3 py-2.5">
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
          {/* Thanh tab — mỗi tab là 1 button bo góc */}
          <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setActiveTab(t.value)}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  activeTab === t.value
                    ? "bg-[#007e42] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Nội dung tab */}
          <div className="p-6">
            {/* Mô tả */}
            {activeTab === "mo-ta" && (
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {product.description?.trim() || "Chưa có mô tả cho sản phẩm này."}
              </p>
            )}

            {/* Hướng dẫn sử dụng */}
            {activeTab === "huong-dan" && (
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {product.usageInstructions}
              </p>
            )}

            {/* Thành phần / hoạt chất */}
            {activeTab === "thanh-phan" && (
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {product.ingredients}
              </p>
            )}
          </div>
        </div>

        {/* ── Đánh giá sản phẩm ── */}
        <div id="danh-gia" className="mt-10 scroll-mt-24 overflow-hidden rounded-2xl border border-[#007e42]/15 bg-white p-6 shadow-sm">
          <h2 className="-mx-6 -mt-6 mb-6 bg-[#007e42] px-6 py-3 text-lg font-extrabold uppercase text-white sm:text-xl">
            Đánh giá sản phẩm
          </h2>

          {/* Tổng quan điểm */}
          <div className="mb-6 flex items-center gap-4 rounded-xl border border-gray-300 bg-white p-4">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-amber-500">
                {ratingValue.toFixed(1)}
              </p>
              <Stars rating={ratingValue} />
            </div>
            <span className="h-10 w-px bg-gray-200" />
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{ratingCount}</span>{" "}
              lượt đánh giá
            </p>
          </div>

          {/* Lưu ý: việc đánh giá thực hiện ở trang "Đơn hàng của tôi" (theo từng đơn đã giao). */}

          {/* Danh sách đánh giá */}
          {reviews.length === 0 ? (
            <div className="rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm text-gray-400">
              Chưa có đánh giá nào. Hãy là người đầu tiên!
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((r) => (
                <div
                  key={r._id}
                  className="rounded-xl border border-gray-300 bg-gray-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">
                      {r.userName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="mt-1">
                    <Stars rating={r.rating} />
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-sm text-gray-600">{r.comment}</p>
                  )}
                  {r.images && r.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.images.map((img) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={img.publicId}
                          src={img.url}
                          alt="ảnh đánh giá"
                          className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Sản phẩm liên quan ── */}
        {related.length > 0 && (
          <div className="mt-10 overflow-hidden rounded-2xl border border-[#007e42]/15 bg-[#e5e7eb] p-6 shadow-sm">
            <h2 className="-mx-6 -mt-6 mb-6 bg-[#007e42] px-6 py-3 text-lg font-extrabold uppercase text-white sm:text-xl">
              Sản phẩm liên quan
            </h2>
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
