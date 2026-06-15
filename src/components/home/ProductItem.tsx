"use client";

import Link from "next/link";
import type { Product } from "@/types/product";
import { fmt } from "@/lib/format";
import { Stars } from "@/components/Stars";
import { BADGE_STYLES, ILeaf } from "@/components/icons";

function discountPercent(product: Product) {
  if (product.originalPrice && product.originalPrice > product.price) {
    return Math.round((1 - product.price / product.originalPrice) * 100);
  }
  return 0;
}

function ProductImageBox({
  product,
  size,
}: {
  product: Product;
  size: number;
}) {
  const img = product.images?.[0]?.url;
  return (
    <>
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
  const discountPct = discountPercent(product);

  return (
    <Link
      href={`/san-pham/${product._id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white/40 transition-all duration-300 hover:bg-white"
    >
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
      <div className="relative flex h-64 items-center justify-center overflow-hidden">
        <div className="relative flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:-translate-y-2">
          <ProductImageBox product={product} size={64} />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.manufacturer && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#007e42]/70">
            {product.manufacturer}
          </span>
        )}
        <span className="line-clamp-2 text-sm font-bold uppercase leading-snug text-gray-800 transition group-hover:text-[#007e42] min-h-[2.5rem]">
          {product.name}
        </span>

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
    </Link>
  );
}

/* ── Product Row (List view) ── */
export function ProductRow({ product }: { product: Product }) {
  const discountPct = discountPercent(product);

  return (
    <Link
      href={`/san-pham/${product._id}`}
      className="group flex items-center gap-4 rounded-xl bg-white/40 p-4 transition hover:bg-white"
    >
      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        <ProductImageBox product={product} size={40} />
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
        <span className="text-sm font-bold uppercase text-gray-800 group-hover:text-[#007e42] line-clamp-1">
          {product.name}
        </span>
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
    </Link>
  );
}
