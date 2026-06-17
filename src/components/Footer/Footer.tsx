import Link from "next/link";
import Image from "next/image";
import { SHOP_LOCATION } from "@/lib/shop-location";

/* ─────────────────────────────────────────
   Icons (inline SVG — tông trắng trên nền xanh)
───────────────────────────────────────── */
function IPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function IMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 5L2 7" />
    </svg>
  );
}
function IPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}
function IYoutube() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  );
}

/* ── Cấu hình link ── */
const productLinks = [
  { label: "Phân bón", href: "/phan-bon" },
  { label: "Thuốc BVTV", href: "/thuoc-bvtv" },
  { label: "Giỏ hàng", href: "/gio-hang" },
  { label: "Đơn hàng của tôi", href: "/don-hang" },
];

const supportLinks = [
  { label: "Hướng dẫn mua hàng", href: "#" },
  { label: "Chính sách đổi trả", href: "#" },
  { label: "Chính sách bảo mật", href: "#" },
  { label: "Câu hỏi thường gặp", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#007e42] text-white">
      {/* Wave separator — lượn sóng ở mép trên, đồng bộ với hero */}
      <div className="absolute left-0 top-0 w-full -translate-y-full leading-none pointer-events-none">
        <svg
          viewBox="0 0 1440 32"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-6 sm:h-8 fill-[#007e42]"
        >
          <path d="M0,8 C320,0 640,0 960,16 C1120,24 1280,24 1440,8 L1440,32 L0,32 Z" />
        </svg>
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* ── Cột thương hiệu ── */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 overflow-hidden rounded-xl bg-white/20 shadow-inner ring-1 ring-white/30">
                <Image src="/caylua.jpg" alt="TP Agri Logo" fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold leading-none tracking-tight">
                  TP Agri
                </span>
                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-100/90">
                  Agriculture
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-emerald-50/85">
              Đồng hành cùng bà con nông dân — cung cấp phân bón, thuốc bảo vệ
              thực vật chính hãng, giá tốt, giao hàng nhanh cho mùa vụ bội thu.
            </p>
            {/* Mạng xã hội */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
              >
                <IFacebook />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
              >
                <IYoutube />
              </a>
            </div>
          </div>

          {/* ── Cột sản phẩm ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-100">
              Sản phẩm
            </h3>
            <ul className="flex flex-col gap-2.5">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-emerald-50/85 transition hover:text-white hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Cột hỗ trợ ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-100">
              Hỗ trợ
            </h3>
            <ul className="flex flex-col gap-2.5">
              {supportLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-emerald-50/85 transition hover:text-white hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Cột liên hệ ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-100">
              Liên hệ
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-emerald-50/85">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 text-emerald-100">
                  <IPin />
                </span>
                <span>{SHOP_LOCATION.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="shrink-0 text-emerald-100">
                  <IPhone />
                </span>
                <a href="tel:19001234" className="transition hover:text-white">
                  1900 1234
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="shrink-0 text-emerald-100">
                  <IMail />
                </span>
                <a
                  href="mailto:hotro@tpagri.vn"
                  className="transition hover:text-white"
                >
                  hotro@tpagri.vn
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Thanh bản quyền ── */}
      <div className="border-t border-white/15 bg-[#006838]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-emerald-50/80 sm:flex-row lg:px-10">
          <p>© {new Date().getFullYear()} TP Agri. Bảo lưu mọi quyền.</p>
          <p>Phân bón &amp; Thuốc bảo vệ thực vật cho cây lúa.</p>
        </div>
      </div>
    </footer>
  );
}
