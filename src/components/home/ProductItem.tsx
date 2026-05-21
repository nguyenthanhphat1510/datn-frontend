"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { fmt } from "@/lib/format";
import { Stars } from "@/components/Stars";
import { BADGE_STYLES, ICart, IEye, IHeart, ILeaf } from "@/components/icons";

function discountPercent(product: Product) {
  if (product.originalPrice && product.originalPrice > product.price) {
    return Math.round((1 - product.price / product.originalPrice) * 100);
  }
  return 0;
}

function ProductImageBox({
  product,
  size,
  rounded = "",
}: {
  product: Product;
  size: number;
  rounded?: string;
}) {
  const img = product.images?.[0]?.url;
  return (
    <>
      <div className={`absolute inset-0 opacity-30 bg-[radial-gradient(rgba(0,126,66,0.15)_1px,transparent_1px)] [background-size:${size > 40 ? 16 : 12}px_${size > 40 ? 16 : 12}px] ${rounded}`} />
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img}
          alt={product.name}
          className="relative z-[1] h-full w-full object-contain"
        />
      ) : (
        <ILeaf size={size} />
      )}
    </>
  );
}

/* ── Product Card (Grid) ── */
export function ProductCard({ product }: { product: Product }) {
  const [carted, setCarted] = useState(false);
  const [wished, setWished] = useState(false);
  const discountPct = discountPercent(product);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#007e42]/30 hover:shadow-xl">
      {/* Badges */}
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
        {product.badge && (
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow ${BADGE_STYLES[product.badge]}`}>
            {product.badge}
          </span>
        )}
        {discountPct > 0 && (
          <span className="rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Image area */}
      <div className="relative flex h-60 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100">
        <ProductImageBox product={product} size={56} />
        {/* Action overlay */}
        <div className="absolute inset-x-0 bottom-0 z-[2] flex translate-y-full items-center justify-center gap-2 bg-black/40 py-2 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0">
          <button
            onClick={() => {
              setCarted(true);
              setTimeout(() => setCarted(false), 1500);
            }}
            title="Thêm vào giỏ"
            className={`flex h-8 w-8 items-center justify-center rounded-full text-white transition ${carted ? "bg-[#007e42]" : "bg-white/20 hover:bg-[#007e42]"}`}
          >
            <ICart />
          </button>
          <button
            onClick={() => setWished((w) => !w)}
            title="Yêu thích"
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${wished ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-red-500"}`}
          >
            <IHeart />
          </button>
          <Link
            href={`/san-pham/${product._id}`}
            title="Xem nhanh"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-[#007e42]"
          >
            <IEye />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        {product.manufacturer && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#007e42]/70">
            {product.manufacturer}
          </span>
        )}
        <Link
          href={`/san-pham/${product._id}`}
          className="line-clamp-2 text-sm font-bold uppercase leading-snug text-gray-800 transition hover:text-[#007e42] min-h-[2.5rem]"
        >
          {product.name}
        </Link>

        {product.rating ? (
          <div className="flex items-center gap-1.5">
            <Stars rating={product.rating} />
            <span className="text-xs text-gray-400">({product.ratingCount ?? 0} đánh giá)</span>
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-baseline gap-1.5 pt-1">
          <span className="text-base font-bold text-[#007e42]">{fmt(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">{fmt(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Product Row (List view) ── */
export function ProductRow({ product }: { product: Product }) {
  const discountPct = discountPercent(product);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-[#007e42]/30 hover:shadow-md">
      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-emerald-50 to-teal-100">
        <ProductImageBox product={product} size={40} rounded="rounded-lg" />
        {product.badge && (
          <span className={`absolute left-1 top-1 z-[2] rounded px-1.5 py-0.5 text-[9px] font-bold uppercase text-white shadow ${BADGE_STYLES[product.badge]}`}>
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
        {product.manufacturer && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#007e42]/70">{product.manufacturer}</span>
        )}
        <Link href={`/san-pham/${product._id}`} className="text-sm font-bold uppercase text-gray-800 hover:text-[#007e42] line-clamp-1">
          {product.name}
        </Link>
        {product.rating ? (
          <div className="flex items-center gap-2">
            <Stars rating={product.rating} />
            <span className="text-xs text-gray-400">({product.ratingCount ?? 0})</span>
          </div>
        ) : null}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-[#007e42]">{fmt(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-xs text-gray-400 line-through">{fmt(product.originalPrice)}</span>
              {discountPct > 0 && (
                <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-500">
                  -{discountPct}%
                </span>
              )}
            </>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button title="Yêu thích" className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-red-500 hover:text-red-500">
          <IHeart />
        </button>
        <button title="Thêm vào giỏ" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#007e42] text-[#007e42] transition hover:bg-[#007e42] hover:text-white">
          <ICart />
        </button>
      </div>
    </div>
  );
}
