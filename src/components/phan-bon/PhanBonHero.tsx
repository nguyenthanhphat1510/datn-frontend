"use client";

import Image from "next/image";
import Link from "next/link";

const products = [
  {
    img: "/phan-dam-ca-mau.png",
    label: "Phân Đạm",
    sub: "Cho lá xanh tốt",
    accent: "#10b981",
  },
  {
    img: "/phan-npk-gold-ca-mau.png",
    label: "Phân NPK",
    sub: "Cân đối toàn diện",
    accent: "#059669",
  },
  {
    img: "/dap-18-46-hat-vang.png",
    label: "Phân DAP",
    sub: "Giàu đạm và lân",
    accent: "#84cc16",
  },
  {
    img: "/kali-ca-mau-60.png",
    label: "Phân Kali",
    sub: "Đòng to, hạt chắc vàng",
    accent: "#d97706",
  },
];

export default function PhanBonHero() {
  return (
    <section
      className="relative w-full overflow-hidden py-12 sm:py-16 lg:py-20"
      style={{ background: "#ffffff" }}
    >
      {/* === Light Ambient Green Glows === */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none z-0 -mr-24 -mt-24 opacity-50"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full blur-[90px] pointer-events-none z-0 -ml-20 -mb-20 opacity-40"
        style={{ background: "radial-gradient(circle, rgba(132,204,22,0.06) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none z-0 -translate-y-1/2 opacity-30"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 70%)" }}
      />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.03)_1px,transparent_1px)] [background-size:24px_24px] opacity-75 z-0 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          
          {/* ── Bên trái: text ── */}
          <div className="flex-shrink-0 lg:w-[480px] xl:w-[540px] space-y-6 text-left">
            
            {/* Tag kính chào bà con */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/10 shadow-[0_2px_10px_rgba(4,120,87,0.03)]"
              style={{ background: "rgba(16,185,129,0.04)" }}
            >
              <Image
                src="/la_lua.png"
                alt="Lá lúa"
                width={16}
                height={16}
                className="h-4 w-4 object-contain"
              />
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
                Kính chào bà con nông dân
              </span>
            </div>

            {/* Tiêu đề chính */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-5xl font-extrabold leading-[1.15] text-slate-800">
              Phân Bón Cho
              <br />
              <span className="relative inline-block my-1">
                <span
                  className="bg-clip-text text-transparent font-black"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #059669 0%, #10b981 50%, #059669 100%)",
                    backgroundSize: "200% auto",
                    animation: "shimmerText 7s linear infinite",
                  }}
                >
                  Bà Con Nông Dân
                </span>
                <svg
                  viewBox="0 0 360 14"
                  className="absolute -bottom-1.5 left-0 w-full"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 8 Q90 2 180 7 T358 6"
                    fill="none"
                    stroke="url(#lightGreenGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  <defs>
                    <linearGradient id="lightGreenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#84cc16" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <br />
              mùa nào cũng <span className="text-[#15803d] font-black drop-shadow-[0_1px_5px_rgba(21,128,61,0.15)]">bội thu</span>
            </h1>

            {/* Divider thanh mảnh */}
            <div
              className="h-[3px] w-20 rounded-full"
              style={{ background: "linear-gradient(90deg, #059669, #10b981, #84cc16)" }}
            />

            {/* Đoạn mô tả ngắn gọn chất lượng */}
            <p className="text-sm sm:text-[15px] leading-relaxed max-w-md text-slate-600">
              Bao phân chính hãng, giá cạnh tranh nhất thị trường. TP Agri tự hào đồng hành cùng nhà nông từ khi làm đất, xuống giống đến ngày lúa chín trĩu bông, mang lại vụ mùa ấm no, trọn vẹn.
            </p>

            {/* Hai nút hành động nổi bật */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="#catalog"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 px-6 text-sm font-bold text-white shadow-[0_4px_18px_rgba(16,185,129,0.2)] transition duration-300 hover:from-emerald-700 hover:to-green-700 hover:shadow-[0_6px_22px_rgba(16,185,129,0.3)] hover:scale-[1.03]"
              >
                <span>Xem bao phân</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="#calculator"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 backdrop-blur-md px-6 text-sm font-bold text-emerald-800 shadow-[0_2px_10px_rgba(4,120,87,0.02)] transition duration-300 hover:bg-emerald-50/50 hover:border-emerald-500/40 hover:scale-[1.03]"
              >
                Tính lượng bón
              </Link>
            </div>

            {/* Các con số thống kê uy tín */}
            <div className="flex gap-6 pt-5 border-t border-emerald-500/10">
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">50+</span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  Sản phẩm
                </span>
              </div>
              <div className="w-px self-stretch bg-emerald-500/15" />
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600">100%</span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  Chính hãng
                </span>
              </div>
              <div className="w-px self-stretch bg-emerald-500/15" />
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black text-lime-600">24/7</span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  Tư vấn kỹ thuật
                </span>
              </div>
            </div>
          </div>

          {/* ── Bên phải: 4 ảnh xếp theo dạng lưới responsive tránh bị đè chồng chéo ── */}
          <div className="flex-1 w-full relative z-10">
            
            {/* Vầng nền mờ sau cùng */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 lg:h-80 lg:w-80 rounded-full pointer-events-none opacity-60 -z-10"
              style={{
                background:
                  "radial-gradient(circle, rgba(167,243,208,0.35) 0%, rgba(209,250,229,0.1) 50%, transparent 75%)",
              }}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 w-full py-6">
              {products.map((product, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={product.label}
                    className={`${isEven ? "-translate-y-1.5" : "translate-y-1.5"}`}
                    style={{
                      animation: "riseIn 0.6s ease-out both",
                      animationDelay: `${idx * 0.15}s`,
                    }}
                  >
                    <div
                      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-[0_4px_16px_rgba(4,120,87,0.06)] transition-all duration-500 hover:-translate-y-2 hover:border-emerald-300 hover:shadow-[0_12px_28px_rgba(4,120,87,0.12)]"
                      style={{
                        animation: "floatCard 6s ease-in-out infinite",
                        animationDelay: `${0.9 + idx * 0.4}s`,
                      }}
                    >
                      {/* Aspect Ratio Container for image */}
                      <div className="relative w-full aspect-[4/5] flex items-center justify-center p-3 bg-gradient-to-b from-[#007e42]/25 via-[#007e42]/8 to-white">
                        <Image
                          src={product.img}
                          alt={product.label}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          priority={idx === 1}
                          className="object-contain p-2 drop-shadow-[0_6px_10px_rgba(4,120,87,0.05)] transition-transform duration-500 group-hover:scale-[1.06]"
                        />
                      </div>

                      {/* Bottom info section */}
                      <div className="flex min-h-17 flex-col items-center justify-center gap-1.5 border-t border-emerald-50 p-3 text-center">
                        <p className="text-[13px] font-extrabold tracking-wide text-slate-800">
                          {product.label}
                        </p>
                        <span
                          className="h-0.5 w-6 rounded-full"
                          style={{ background: product.accent }}
                        />
                        <p className="text-[10px] font-semibold text-slate-500">
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
        @keyframes riseIn {
          0%   { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Wave separator matching the parent page background color (#f9fcfb) */}
      <div className="absolute bottom-0 left-0 w-full leading-none z-10 translate-y-1 pointer-events-none">
        <svg
          viewBox="0 0 1440 32"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-6 sm:h-8 text-[#e5e7eb] fill-current"
        >
          <path d="M0,24 C320,32 640,32 960,16 C1120,8 1280,8 1440,24 L1440,32 L0,32 Z" />
        </svg>
      </div>
    </section>
  );
}
