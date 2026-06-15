"use client";

import Image from "next/image";

const stages = [
  {
    id: 1,
    no: "01",
    label: "Lúa Mạ Non",
    tag: "Giai đoạn 1",
    img: "/young_rice.png",
    glow: "group-hover:shadow-emerald-500/30",
    border: "group-hover:ring-emerald-400/60",
    tint: "linear-gradient(to bottom, rgba(110,231,183,0.25) 0%, transparent 45%)",
    tagGradient: "linear-gradient(90deg,#34d399,#6ee7b7)",
  },
  {
    id: 2,
    no: "02",
    label: "Lúa Trưởng Thành",
    tag: "Giai đoạn 2",
    img: "/mature_rice.png",
    glow: "group-hover:shadow-green-500/30",
    border: "group-hover:ring-green-400/60",
    tint: "linear-gradient(to bottom, rgba(34,197,94,0.28) 0%, transparent 45%)",
    tagGradient: "linear-gradient(90deg,#22c55e,#a3e635)",
  },
  {
    id: 3,
    no: "03",
    label: "Lúa Chín Vàng",
    tag: "Giai đoạn 3",
    img: "/ripe_rice.png",
    glow: "group-hover:shadow-lime-500/30",
    border: "group-hover:ring-lime-400/60",
    tint: "linear-gradient(to bottom, rgba(253,230,138,0.28) 0%, transparent 45%)",
    tagGradient: "linear-gradient(90deg,#a3e635,#fde68a)",
  },
];

export default function HeroImage() {
  return (
    <section
      className="w-full relative overflow-hidden text-white py-10 sm:py-14 lg:py-16"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">

          {/* ── Left: Text Block ── */}
          <div className="flex-shrink-0 lg:w-[460px] xl:w-[520px] space-y-5 text-left">

            {/* Eyebrow badge */}
            <div
              className="inline-flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border border-emerald-300/40 shadow-lg shadow-emerald-900/30 backdrop-blur-sm"
              style={{
                background:
                  "linear-gradient(90deg, rgba(52,211,153,0.18) 0%, rgba(16,185,129,0.06) 100%)",
              }}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/20 ring-1 ring-emerald-300/40">
                <Image
                  src="/la_lua.png"
                  alt="Lá lúa"
                  width={18}
                  height={18}
                  className="h-4.5 w-4.5 object-contain"
                />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-100">
                Nông nghiệp chất lượng cao
              </span>
              <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
            </div>

            {/* Main heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-5xl font-extrabold tracking-normal leading-[1.15] text-white">
              Đồng Hành Cùng
              <br />
              <span
                className="bg-clip-text text-transparent uppercase font-black"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #6ee7b7 0%, #34d399 20%, #a3e635 55%, #fde68a 80%, #6ee7b7 100%)",
                  backgroundSize: "200% auto",
                  animation: "shimmerText 7s linear infinite",
                }}
              >
                3 Thời Kỳ Vàng
              </span>
              <br />
              Của Cây Lúa
            </h1>

            {/* Animated gradient divider */}
            <div
              className="h-[3px] w-20 rounded-full"
              style={{
                background: "linear-gradient(90deg, #34d399, #a3e635, #fde68a)",
              }}
            />

            {/* Description */}
            <p className="text-sm sm:text-[15px] leading-relaxed max-w-sm" style={{ color: "rgba(209,250,229,0.85)" }}>
              TP Agri cung cấp giải pháp vật tư nông nghiệp được chuẩn hóa theo từng giai đoạn sinh trưởng của cây lúa, giúp tối ưu năng suất và tiết kiệm chi phí canh tác.
            </p>

            {/* Stats row */}
            <div className="flex gap-5 pt-2">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-emerald-200">100%</span>
                <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wide mt-0.5">
                  Đúng kỹ thuật
                </span>
              </div>
              <div className="w-px self-stretch" style={{ background: "rgba(255,255,255,0.12)" }} />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-lime-200">3 Đợt</span>
                <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wide mt-0.5">
                  Chăm sóc chuẩn
                </span>
              </div>
              <div className="w-px self-stretch" style={{ background: "rgba(255,255,255,0.12)" }} />
              <div className="flex flex-col">
                <span className="text-2xl font-black" style={{ color: "#fde68a" }}>98%</span>
                <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wide mt-0.5">
                  Hài lòng
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: Image Gallery ── */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {stages.map((stage, idx) => (
                <div
                  key={stage.id}
                  className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer ${stage.glow} motion-safe:animate-[floatCard_6s_ease-in-out_infinite]`}
                  style={{
                    aspectRatio: "4/5",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                    animationDelay: `${idx * 0.8}s`,
                  }}
                >
                  {/* The photo */}
                  <Image
                    src={stage.img}
                    alt={stage.label}
                    fill
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    priority={idx === 0}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />

                  {/* Stage-color top tint */}
                  <div
                    className="absolute inset-0 z-[5] pointer-events-none mix-blend-soft-light"
                    style={{ background: stage.tint }}
                  />

                  {/* Big stage number watermark */}
                  <div className="absolute top-2 left-3 z-20 pointer-events-none">
                    <span
                      className="text-4xl sm:text-5xl font-black leading-none"
                      style={{
                        color: "transparent",
                        WebkitTextStroke: "1.5px rgba(255,255,255,0.55)",
                        textShadow: "0 2px 12px rgba(0,0,0,0.35)",
                      }}
                    >
                      {stage.no}
                    </span>
                  </div>

                  {/* Gradient border ring */}
                  <div
                    className={`absolute inset-0 rounded-2xl sm:rounded-3xl ring-1 ring-white/10 transition-all duration-300 z-10 ${stage.border}`}
                  />

                  {/* Bottom gradient scrim */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-20 z-10 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(1,31,14,0.85) 0%, rgba(1,31,14,0.35) 60%, transparent 100%)",
                    }}
                  />

                  {/* Label */}
                  <div className="absolute bottom-3 left-0 right-0 z-20 px-2 text-center">
                    <p className="text-xs sm:text-sm text-white font-bold tracking-wide drop-shadow">
                      {stage.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stage tags below */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-3">
              {stages.map((stage) => (
                <div key={stage.id} className="flex justify-center">
                  <div
                    className="inline-flex items-center px-3 py-1 rounded-full border border-white/10"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <span
                      className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-clip-text text-transparent"
                      style={{
                        backgroundImage: stage.tagGradient,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {stage.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes shimmerText {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
      `}</style>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 w-full leading-none z-10 translate-y-1 pointer-events-none">
        <svg
          viewBox="0 0 1440 32"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-6 sm:h-8 text-white fill-current"
        >
          <path d="M0,24 C320,32 640,32 960,16 C1120,8 1280,8 1440,24 L1440,32 L0,32 Z" />
        </svg>
      </div>
    </section>
  );
}
