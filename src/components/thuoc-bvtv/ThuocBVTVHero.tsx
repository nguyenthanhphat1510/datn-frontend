"use client";

import Image from "next/image";
import Link from "next/link";

const products = [
  {
    img: "/thuoc_tru_sau1.png",
    label: "Thuốc trừ sâu",
    sub: "Diệt rầy, sâu cuốn lá",
    accent: "#10b981",
  },
  {
    img: "/thuoc_tru_benh1.png",
    label: "Thuốc trừ bệnh",
    sub: "Đặc trị đạo ôn, khô vằn",
    accent: "#059669",
  },
  {
    img: "/thuoc_tru_co1.png",
    label: "Thuốc trừ cỏ",
    sub: "Sạch cỏ, an toàn lúa",
    accent: "#d97706",
  },
];

export default function ThuocBVTVHero() {
  return (
    <section
      className="relative w-full overflow-hidden text-white py-10 sm:py-14 lg:py-16"
      style={{
        background:
          "linear-gradient(135deg, #011f0e 0%, #013d1c 25%, #025c2a 50%, #016b30 70%, #0a8040 85%, #12924a 100%)",
      }}
    >
      {/* === Multi-layer ambient glows === */}
      <div
        className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full blur-[120px] pointer-events-none z-0 -mr-24 -mt-24"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[480px] h-[480px] rounded-full blur-[100px] pointer-events-none z-0 -ml-24 -mb-24"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full blur-[90px] pointer-events-none z-0 -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(circle, rgba(110,231,183,0.08) 0%, transparent 70%)" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:30px_30px] opacity-40 z-0 pointer-events-none" />
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 24px)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">

          {/* ── Bên trái: text ── */}
          <div className="flex-shrink-0 lg:w-115 xl:w-130 space-y-5 text-left">

            {/* Tag */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-300/40 shadow-lg shadow-emerald-900/30 backdrop-blur-sm"
              style={{
                background:
                  "linear-gradient(90deg, rgba(52,211,153,0.18) 0%, rgba(16,185,129,0.06) 100%)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-100">
                🛡️ Bảo vệ cây trồng toàn diện
              </span>
            </div>

            {/* Tiêu đề chính */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-5xl font-extrabold leading-[1.15] text-white">
              Thuốc Bảo Vệ
              <br />
              <span className="relative inline-block my-1">
                <span
                  className="bg-clip-text text-transparent font-black"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #6ee7b7 0%, #34d399 20%, #a3e635 55%, #fde68a 80%, #6ee7b7 100%)",
                    backgroundSize: "200% auto",
                    animation: "shimmerText 7s linear infinite",
                  }}
                >
                  Thực Vật Chính Hãng
                </span>
                <svg
                  viewBox="0 0 360 14"
                  className="absolute -bottom-1.5 left-0 w-full"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 8 Q90 2 180 7 T358 6"
                    fill="none"
                    stroke="url(#lightGreenGradientBVTV)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  <defs>
                    <linearGradient id="lightGreenGradientBVTV" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#84cc16" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <br />
              an toàn &amp; <span className="text-[#fde68a] font-black drop-shadow-[0_1px_8px_rgba(253,230,138,0.3)]">hiệu quả</span>
            </h1>

            {/* Divider */}
            <div
              className="h-[3px] w-20 rounded-full"
              style={{ background: "linear-gradient(90deg, #059669, #10b981, #84cc16)" }}
            />

            {/* Mô tả */}
            <p className="text-sm sm:text-[15px] leading-relaxed max-w-md" style={{ color: "rgba(209,250,229,0.85)" }}>
              Giải pháp đặc trị sâu rầy, đạo ôn, khô vằn, cỏ dại cho cây lúa. Cam kết hàng chính hãng, hướng dẫn pha chế chuẩn từ kỹ sư nông học, đồng hành cùng bà con suốt mùa vụ.
            </p>

            {/* Nút hành động */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="#catalog"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 px-6 text-sm font-bold text-white shadow-[0_4px_18px_rgba(16,185,129,0.2)] transition duration-300 hover:from-emerald-700 hover:to-green-700 hover:shadow-[0_6px_22px_rgba(16,185,129,0.3)] hover:scale-[1.03]"
              >
                <span>Xem sản phẩm</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="#guide"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-emerald-300/30 bg-white/10 backdrop-blur-md px-6 text-sm font-bold text-emerald-50 shadow-[0_2px_10px_rgba(0,0,0,0.15)] transition duration-300 hover:bg-white/20 hover:border-emerald-300/50 hover:scale-[1.03]"
              >
                Cẩm nang sâu bệnh
              </Link>
            </div>

            {/* Số thống kê */}
            <div className="flex gap-6 pt-5 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black text-emerald-200">100+</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                  Hoạt chất đặc trị
                </span>
              </div>
              <div className="w-px self-stretch bg-white/12" />
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black text-lime-200">7+</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                  Thương hiệu lớn
                </span>
              </div>
              <div className="w-px self-stretch bg-white/12" />
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black" style={{ color: "#fde68a" }}>98%</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                  Hiệu lực phòng trị
                </span>
              </div>
            </div>
          </div>

          {/* ── Bên phải: 3 ảnh xếp sát nhau, so le cao-thấp ── */}
          <div className="flex-1 w-full relative z-10">

            {/* Vầng nền mờ */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 lg:h-80 lg:w-80 rounded-full pointer-events-none opacity-60 -z-10"
              style={{
                background:
                  "radial-gradient(circle, rgba(167,243,208,0.35) 0%, rgba(209,250,229,0.1) 50%, transparent 75%)",
              }}
            />

            {/* 3 ảnh xếp xòe sẵn kiểu bộ bài (fan/stack) — xòe rộng ngay từ đầu,
               hai tấm bên ló ra rõ, không bị tấm giữa che nhãn. */}
            <div className="relative mx-auto flex h-[340px] w-full max-w-xl items-center justify-center px-2 py-6 sm:h-[380px]">
              {products.map((product, idx) => {
                // idx 0 = trái (xoay âm, lệch trái + xuống), 1 = giữa (thẳng, nổi trên), 2 = phải (xoay dương, lệch phải + xuống)
                const fan = [
                  "-rotate-[14deg] -translate-x-[78%] translate-y-8 z-10",
                  "rotate-0 -translate-y-4 z-20",
                  "rotate-[14deg] translate-x-[78%] translate-y-8 z-10",
                ][idx];

                return (
                  <div
                    key={product.label}
                    className={`group/card absolute w-36 transition-all duration-500 ease-out hover:!z-30 sm:w-40 ${fan}`}
                  >
                    <div
                      className="relative cursor-pointer overflow-hidden rounded-2xl ring-1 ring-white/10 backdrop-blur-sm shadow-[0_8px_28px_rgba(0,0,0,0.32)] transition-all duration-500 hover:-translate-y-2 hover:ring-emerald-300/50 hover:shadow-[0_18px_42px_rgba(0,0,0,0.45)]"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        animation: "floatCard 6s ease-in-out infinite",
                        animationDelay: `${idx * 0.5}s`,
                      }}
                    >
                      {/* Ảnh sản phẩm */}
                      <div className="relative flex aspect-[4/5] w-full items-center justify-center p-2 bg-[linear-gradient(to_bottom,rgba(110,231,183,0.2)_0%,rgba(52,211,153,0.08)_45%,transparent_100%)]">
                        <Image
                          src={product.img}
                          alt={product.label}
                          fill
                          sizes="(max-width: 640px) 50vw, 200px"
                          priority={idx === 1}
                          className="object-contain p-1 drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover/card:scale-[1.06]"
                        />
                      </div>

                      {/* Nhãn */}
                      <div className="flex flex-col items-center justify-center gap-1 border-t border-white/10 p-2.5 text-center">
                        <p className="text-xs font-extrabold tracking-wide text-white">
                          {product.label}
                        </p>
                        <span
                          className="h-0.5 w-6 rounded-full"
                          style={{ background: product.accent }}
                        />
                        <p className="text-[10px] font-semibold text-emerald-200/80">
                          {product.sub}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* === Keyframe Animations & Styles === */}
      <style>{`
        @keyframes shimmerText {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
      `}</style>

      {/* Wave separator matching the parent page background (#f9fcfb) */}
      <div className="absolute bottom-0 left-0 w-full leading-none z-10 translate-y-1 pointer-events-none">
        <svg
          viewBox="0 0 1440 32"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-6 sm:h-8 text-[#f9fcfb] fill-current"
        >
          <path d="M0,24 C320,32 640,32 960,16 C1120,8 1280,8 1440,24 L1440,32 L0,32 Z" />
        </svg>
      </div>
    </section>
  );
}
