"use client";

import Image from "next/image";
import Link from "next/link";

const products = [
  {
    img: "/phanbon.png",
    label: "Phân Đạm",
    sub: "Cho lá xanh",
    accent: "#15803d",
  },
  {
    img: "/phanbon.png",
    label: "Phân NPK",
    sub: "Cân đối toàn diện",
    accent: "#15803d",
  },
  {
    img: "/phanbon.png",
    label: "Hữu cơ vi sinh",
    sub: "Cải tạo đất",
    accent: "#65a30d",
  },
];

export default function PhanBonHero() {
  return (
    <section
      className="relative w-full overflow-hidden py-6 sm:py-8 lg:py-10"
      style={{
        background:
          "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 35%, #a7f3d0 70%, #6ee7b7 100%)",
      }}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          {/* ── Bên trái: text ── */}
          <div className="flex-shrink-0 lg:w-[480px] xl:w-[540px] space-y-5 text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 border border-emerald-700/15 shadow-sm">
              <span className="text-sm">🌾</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-900">
                Kính chào bà con nông dân
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-5xl font-extrabold leading-[1.15] text-stone-900">
              Phân bón cho
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-[#15803d]">bà con nông dân</span>
                <svg
                  viewBox="0 0 360 14"
                  className="absolute -bottom-1 left-0 w-full"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 8 Q90 2 180 7 T358 6"
                    fill="none"
                    stroke="#84cc16"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                </svg>
              </span>
              <br />
              mùa nào cũng <span className="text-lime-700">bội thu</span>
            </h1>

            <div
              className="h-[3px] w-20 rounded-full"
              style={{ background: "linear-gradient(90deg, #047857, #15803d, #84cc16)" }}
            />

            <p className="text-sm sm:text-[15px] leading-relaxed max-w-md text-stone-700">
              Bao phân chính hãng, giá phải chăng. Tụi tui đồng hành cùng nhà nông từ lúc xuống giống đến khi gặt về,
              giúp lúa trổ đều, hạt mẩy, bao no.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="#catalog"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#15803d] px-6 text-sm font-bold text-white shadow-md transition hover:bg-[#166534] hover:shadow-lg"
              >
                <span>Xem bao phân</span>
                <span>→</span>
              </Link>
              <Link
                href="#calculator"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-emerald-700/30 bg-white/70 px-5 text-sm font-bold text-emerald-900 transition hover:bg-white hover:border-emerald-700"
              >
                Tính lượng bón
              </Link>
            </div>

            <div className="flex gap-5 pt-3">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-[#15803d]">50+</span>
                <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-wide mt-0.5">
                  Sản phẩm
                </span>
              </div>
              <div className="w-px self-stretch bg-emerald-700/20" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-emerald-700">100%</span>
                <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-wide mt-0.5">
                  Chính hãng
                </span>
              </div>
              <div className="w-px self-stretch bg-emerald-700/20" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-lime-700">24/7</span>
                <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-wide mt-0.5">
                  Tư vấn
                </span>
              </div>
            </div>
          </div>

          {/* ── Bên phải: 3 ảnh xếp lệch tầng ── */}
          <div className="flex-1 w-full relative flex items-center justify-center min-h-[280px] lg:min-h-[320px]">
            {/* Ảnh giữa - to nhất, đứng trước */}
            <div className="relative z-30">
              <div className="absolute inset-0 -m-3 rounded-3xl bg-white shadow-2xl ring-1 ring-emerald-700/10" />
              <div className="relative w-44 h-56 lg:w-52 lg:h-64 flex items-center justify-center">
                <Image
                  src={products[1].img}
                  alt={products[1].label}
                  fill
                  sizes="(max-width: 1024px) 224px, 256px"
                  priority
                  className="object-contain p-4 drop-shadow-[0_12px_15px_rgba(120,53,15,0.2)]"
                />
              </div>
              {/* Tag tên */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1.5 shadow-md ring-1 ring-emerald-700/15 z-10">
                <p className="text-xs font-black text-stone-800">{products[1].label}</p>
                <p className="text-[10px] font-semibold text-center" style={{ color: products[1].accent }}>
                  {products[1].sub}
                </p>
              </div>
            </div>

            {/* Ảnh trái - nhỏ hơn, lệch xuống, xoay nhẹ */}
            <div
              className="absolute left-0 lg:left-4 top-1/2 -translate-y-1/3 z-20"
              style={{ transform: "translateY(-20%) rotate(-6deg)" }}
            >
              <div className="absolute inset-0 -m-2 rounded-2xl bg-white shadow-xl ring-1 ring-emerald-700/10" />
              <div className="relative w-28 h-36 lg:w-32 lg:h-44 flex items-center justify-center">
                <Image
                  src={products[0].img}
                  alt={products[0].label}
                  fill
                  sizes="(max-width: 1024px) 144px, 176px"
                  className="object-contain p-3 drop-shadow-[0_10px_12px_rgba(120,53,15,0.18)]"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-700 px-3 py-1 shadow-md z-10">
                <p className="text-[10px] font-black uppercase tracking-wider text-white">
                  {products[0].label}
                </p>
              </div>
            </div>

            {/* Ảnh phải - nhỏ hơn, lệch lên, xoay nhẹ */}
            <div
              className="absolute right-0 lg:right-4 top-1/2 z-20"
              style={{ transform: "translateY(-65%) rotate(8deg)" }}
            >
              <div className="absolute inset-0 -m-2 rounded-2xl bg-white shadow-xl ring-1 ring-emerald-700/10" />
              <div className="relative w-24 h-32 lg:w-28 lg:h-40 flex items-center justify-center">
                <Image
                  src={products[2].img}
                  alt={products[2].label}
                  fill
                  sizes="(max-width: 1024px) 128px, 160px"
                  className="object-contain p-3 drop-shadow-[0_10px_12px_rgba(120,53,15,0.18)]"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-lime-700 px-3 py-1 shadow-md z-10">
                <p className="text-[10px] font-black uppercase tracking-wider text-white">
                  {products[2].label}
                </p>
              </div>
            </div>

            {/* Vầng nền mờ sau cùng */}
            <div
              className="absolute h-64 w-64 lg:h-72 lg:w-72 rounded-full -z-0"
              style={{
                background:
                  "radial-gradient(circle, rgba(254,243,199,0.9) 0%, rgba(253,224,71,0.25) 50%, transparent 80%)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
