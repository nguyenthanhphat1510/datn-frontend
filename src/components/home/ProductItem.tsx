"use client";

import Link from "next/link";
import type { Product } from "@/types/product";
import { fmt } from "@/lib/format";
import { Stars } from "@/components/Stars";
import { BADGE_STYLES, ILeaf } from "@/components/icons";

/* Làm sạch chuỗi thành phần để hiện gọn dưới tên trên thẻ: bỏ gạch đầu dòng, chuỗi
   dấu chấm căn lề ("……"), khoảng trắng thừa. Vd "– Tebufenpyrad……250g/kg – Thiamethoxam"
   → "Tebufenpyrad 250g/kg, Thiamethoxam". Cắt 1 dòng bằng line-clamp ở JSX. Không đổi DB. */
function cleanIngredients(raw: string): string {
  return raw
    .replace(/[.．]{2,}/g, " ") // chuỗi dấu chấm căn lề → 1 khoảng trắng
    .replace(/\s*[–—-]\s*/g, ", ") // gạch ngang ngăn cách → dấu phẩy
    .replace(/^[\s,]+/, "") // bỏ dấu phẩy/khoảng trắng thừa đầu chuỗi
    .replace(/\s+,/g, ",") // khoảng trắng trước dấu phẩy
    .replace(/\s+/g, " ") // gộp khoảng trắng
    .trim();
}

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
          <span className="rounded-md bg-[#007e42] px-2 py-0.5 text-[10px] font-bold text-white shadow">
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Image area */}
      <div className="relative flex h-40 items-center justify-center overflow-hidden sm:h-64">
        <div className="relative flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:-translate-y-2">
          <ProductImageBox product={product} size={64} />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <span className="line-clamp-2 text-sm font-bold uppercase leading-snug text-gray-800 transition group-hover:text-[#007e42] min-h-[2.5rem]">
          {product.name}
        </span>

        {/* Thành phần / hoạt chất — chỉ hiện khi có. -mt-1 kéo sát tên; line-clamp-1 cắt 1 dòng. */}
        {product.ingredients && (
          <span className="-mt-1 line-clamp-1 text-xs text-gray-500" title={product.ingredients}>
            {cleanIngredients(product.ingredients)}
          </span>
        )}

        {/* Hàng đánh giá — luôn chiếm chỗ (kể cả khi chưa có sao) để mọi thẻ đều
            đủ tầng, giữ khoảng cách tới giá đồng đều giữa các thẻ trong lưới. */}
        {product.averageRating ? (
          <div className="flex items-center gap-1.5">
            <Stars rating={product.averageRating} />
            <span className="text-xs text-gray-400">({product.reviewCount ?? 0} đánh giá)</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Chưa có đánh giá</span>
        )}

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
