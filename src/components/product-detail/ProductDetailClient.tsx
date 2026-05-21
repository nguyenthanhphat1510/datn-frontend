"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { fmt } from "@/lib/format";
import { Stars } from "@/components/Stars";
import { BADGE_STYLES, ICart, IHeart, IHome, ILeaf } from "@/components/icons";
import { ProductCard } from "@/components/home/ProductItem";
import { fetchProducts } from "@/services/products";

type Tab = "mo-ta" | "huong-dan";

export default function ProductDetailClient({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("mo-ta");
  const [carted, setCarted] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);

  const images = product.images ?? [];
  const outOfStock = product.stock === 0;
  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  const hasDescription = !!product.description?.trim();
  const hasUsage = !!product.usageInstructions?.trim();
  const showTabs = hasDescription || hasUsage;

  useEffect(() => {
    if (!product.categoryId) return;
    fetchProducts({ categoryId: product.categoryId, limit: 7 })
      .then((res) => {
        setRelated(res.data.filter((p) => p._id !== product._id).slice(0, 6));
      })
      .catch(() => setRelated([]));
  }, [product._id, product.categoryId]);

  const handleAddToCart = () => {
    if (outOfStock) return;
    setCarted(true);
    console.log("Add to cart:", product._id, "qty:", qty);
    setTimeout(() => setCarted(false), 1500);
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
    <section className="relative min-h-screen w-full px-4 py-8 sm:px-6 lg:px-10">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50/30 via-white to-white" />

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

        {/* Main 2-col */}
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">

          {/* ── CỘT TRÁI: Gallery ── */}
          <div className="w-full lg:w-1/2">
            {/* Ảnh lớn */}
            <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-emerald-50 to-teal-100 shadow-sm sm:h-96 lg:h-[440px]">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(rgba(0,126,66,0.15)_1px,transparent_1px)] [background-size:20px_20px]" />
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
                <span className="absolute right-3 top-3 z-10 rounded-lg bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow">
                  -{discountPct}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.publicId}
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      i === activeImage
                        ? "border-[#007e42] shadow-md"
                        : "border-gray-200 hover:border-[#007e42]/50"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── CỘT PHẢI: Info ── */}
          <div className="flex w-full flex-col gap-5 lg:w-1/2">

            {/* Tên + nhà SX */}
            <div>
              <h1 className="text-xl font-extrabold uppercase leading-snug text-gray-900 sm:text-2xl lg:text-3xl">
                {product.name}
              </h1>
              {product.manufacturer && (
                <p className="mt-1 text-sm text-gray-500">
                  Nhà sản xuất: <span className="font-semibold text-gray-700">{product.manufacturer}</span>
                </p>
              )}
            </div>

            {/* Sao đánh giá */}
            {product.rating ? (
              <div className="flex items-center gap-2">
                <Stars rating={product.rating} />
                <span className="text-sm text-gray-400">({product.ratingCount ?? 0} đánh giá)</span>
              </div>
            ) : null}

            <hr className="border-gray-100" />

            {/* Giá */}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[#007e42]">{fmt(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-400 line-through">{fmt(product.originalPrice)}</span>
              )}
              {discountPct > 0 && (
                <span className="rounded-lg bg-red-50 px-2.5 py-1 text-sm font-bold text-red-500">
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

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Số lượng:</span>
              <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
                <button
                  onClick={() => changeQty(-1)}
                  disabled={outOfStock || qty <= 1}
                  className="flex h-10 w-10 items-center justify-center text-gray-600 transition hover:bg-emerald-50 hover:text-[#007e42] disabled:opacity-40"
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
                  className="h-10 w-12 border-x border-gray-200 bg-white text-center text-sm font-semibold text-gray-800 outline-none disabled:opacity-40"
                />
                <button
                  onClick={() => changeQty(1)}
                  disabled={outOfStock || qty >= product.stock}
                  className="flex h-10 w-10 items-center justify-center text-gray-600 transition hover:bg-emerald-50 hover:text-[#007e42] disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
                  outOfStock
                    ? "cursor-not-allowed bg-gray-200 text-gray-400"
                    : carted
                    ? "bg-[#007e42] text-white shadow-lg"
                    : "border border-[#007e42] text-[#007e42] hover:bg-[#007e42] hover:text-white"
                }`}
              >
                <ICart />
                {outOfStock ? "Hết hàng" : carted ? "Đã thêm!" : "Thêm vào giỏ"}
              </button>
              <button
                disabled={outOfStock}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#007e42] px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-[#0a9d52] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                Mua ngay
              </button>
              <button
                title="Yêu thích"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:border-red-400 hover:text-red-500"
              >
                <IHeart />
              </button>
            </div>

            <hr className="border-gray-100" />

            {/* Danh mục */}
            {product.categoryId && (
              <p className="text-sm text-gray-500">
                Danh mục:{" "}
                <span className="font-semibold text-[#007e42]">{product.categoryId}</span>
              </p>
            )}
          </div>
        </div>

        {/* ── Tab Mô tả / Hướng dẫn ── */}
        {showTabs && (
          <div className="mt-12">
            <div className="flex gap-1 border-b border-gray-200">
              {hasDescription && (
                <button
                  onClick={() => setActiveTab("mo-ta")}
                  className={`px-5 py-2.5 text-sm font-semibold transition ${
                    activeTab === "mo-ta"
                      ? "border-b-2 border-[#007e42] text-[#007e42]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Mô tả
                </button>
              )}
              {hasUsage && (
                <button
                  onClick={() => setActiveTab("huong-dan")}
                  className={`px-5 py-2.5 text-sm font-semibold transition ${
                    activeTab === "huong-dan"
                      ? "border-b-2 border-[#007e42] text-[#007e42]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Hướng dẫn sử dụng
                </button>
              )}
            </div>
            <div className="mt-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              {activeTab === "mo-ta" ? (
                hasDescription ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Chưa có thông tin mô tả.</p>
                )
              ) : (
                hasUsage ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                    {product.usageInstructions}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Chưa có hướng dẫn sử dụng.</p>
                )
              )}
            </div>
          </div>
        )}

        {/* ── Sản phẩm liên quan ── */}
        {related.length > 0 && (
          <div className="mt-14">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-[#007e42]" />
              <h2 className="text-lg font-extrabold uppercase text-gray-900 sm:text-xl">
                Sản phẩm liên quan
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
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
