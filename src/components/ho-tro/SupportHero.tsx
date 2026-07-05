"use client";

/**
 * Hero dùng chung cho các trang hỗ trợ tĩnh (hướng dẫn mua hàng, chính sách,
 * FAQ...). Tông xanh + wave separator đồng bộ với hero các trang khác.
 */
export default function SupportHero({
  badge,
  title,
  highlight,
  desc,
}: {
  badge: string;
  title: string;
  highlight: string;
  desc: string;
}) {
  return (
    <section
      className="relative w-full overflow-hidden text-white py-12 sm:py-16 lg:py-20"
      style={{
        background:
          "linear-gradient(135deg, #011f0e 0%, #013d1c 25%, #025c2a 50%, #016b30 70%, #0a8040 85%, #12924a 100%)",
      }}
    >
      {/* Ambient glows */}
      <div
        className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full blur-[120px] pointer-events-none z-0 -mr-24 -mt-24"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[480px] h-[480px] rounded-full blur-[100px] pointer-events-none z-0 -ml-24 -mb-24"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%)" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:30px_30px] opacity-40 z-0 pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-10 z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-300/40 shadow-lg shadow-emerald-900/30 backdrop-blur-sm mb-5"
          style={{
            background:
              "linear-gradient(90deg, rgba(52,211,153,0.18) 0%, rgba(16,185,129,0.06) 100%)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-100">
            {badge}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.15] text-white">
          {title}{" "}
          <span
            className="bg-clip-text text-transparent font-black"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #6ee7b7 0%, #34d399 30%, #a3e635 70%, #fde68a 100%)",
            }}
          >
            {highlight}
          </span>
        </h1>

        <div
          className="mx-auto mt-5 h-[3px] w-20 rounded-full"
          style={{ background: "linear-gradient(90deg, #059669, #10b981, #84cc16)" }}
        />

        <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-[15px] leading-relaxed" style={{ color: "rgba(209,250,229,0.85)" }}>
          {desc}
        </p>
      </div>

      {/* Wave separator (#f9fcfb parent bg) */}
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
