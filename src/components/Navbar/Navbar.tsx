"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import UserMenu from "./UserMenu";
import { useCart } from "@/contexts/CartContext";

/* ─────────────────────────────────────────
   SVG Icons
───────────────────────────────────────── */
function IconCart() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

/** Phân bón — dùng ảnh thật */
function IconFertilizer() {
  return (
    <Image
      src="/phanbon.png"
      alt="Phân bón"
      width={36}
      height={36}
      className="object-contain brightness-0 invert"
    />
  );
}

/** Thuốc BVTV — dùng ảnh thật */
function IconSprayer() {
  return (
    <Image
      src="/thuoc.png"
      alt="Thuốc BVTV"
      width={36}
      height={36}
      className="object-contain brightness-0 invert"
    />
  );
}

/** Bệnh hại lúa — dùng ảnh thật */
function IconDisease() {
  return (
    <Image
      src="/la_lua.png"
      alt="Bệnh hại lúa"
      width={36}
      height={36}
      className="object-contain brightness-0 invert"
    />
  );
}

/** Kỹ thuật canh tác — icon sách/tài liệu */
function IconGuide() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   Nav links (left of search)
───────────────────────────────────────── */
const leftLinks = [
  {
    label: "Phân bón",
    href: "/phan-bon",
    Icon: IconFertilizer,
  },
  {
    label: "Thuốc BVTV",
    href: "/thuoc-bvtv",
    Icon: IconSprayer,
  },
  {
    label: "Bệnh hại lúa",
    href: "/benh-lua",
    Icon: IconDisease,
  },
  {
    label: "Kỹ thuật",
    href: "/ky-thuat",
    Icon: IconGuide,
  },
] as const;

/* ─────────────────────────────────────────
   Search Bar
───────────────────────────────────────── */
function SearchBar({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [phIndex, setPhIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const phrases = [
    "Tìm kiếm phân bón...",
    "Tìm kiếm thuốc bảo vệ thực vật...",
    "Tìm kiếm hạt giống...",
    "Tìm kiếm dụng cụ nông nghiệp..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhIndex((prev) => (prev + 1) % phrases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/tim-kiem?q=${encodeURIComponent(query.trim())}`;
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex h-10 items-center rounded-full border border-transparent bg-white px-4 shadow-sm transition focus-within:ring-2 focus-within:ring-white/60 ${className}`}
    >
      <span className="z-10 text-[#007e42]">
        <IconSearch />
      </span>
      <div className="relative ml-2 flex h-full flex-1 items-center overflow-hidden">
        {/* Animated Placeholder Overlay */}
        {!query && !isFocused && (
          <div className="pointer-events-none absolute inset-0 flex items-center">
            <span
              key={phIndex}
              className="text-sm font-medium text-[#007e42]/60"
              style={{ animation: "0.4s ease 0s 1 normal none running slideUpFade" }}
            >
              {phrases[phIndex]}
            </span>
          </div>
        )}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="relative z-10 h-full w-full bg-transparent text-sm font-medium text-[#007e42] outline-none"
          aria-label="Tìm kiếm"
        />
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────
   Navbar
───────────────────────────────────────── */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-[#005f32] bg-[#007e42] shadow-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-10">

        {/* ── Logo ── */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="relative flex h-10 w-10 overflow-hidden rounded-xl bg-white/20 shadow-inner ring-1 ring-white/30">
            <Image
              src="/caylua.jpg"
              alt="TP Agri Logo"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold leading-none tracking-tight text-white">
              TP Agri
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-100/90">
              Agriculture
            </span>
          </div>
        </Link>

        {/* ── Center section: left nav + search ── */}
        <div className="hidden flex-1 items-center gap-3 md:flex">
          {/* Left nav links */}
          <nav className="flex shrink-0 items-center gap-1">
            {leftLinks.map(({ label, href, Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white/90 transition hover:bg-white/15 hover:text-white"
              >
                <span className="transition group-hover:scale-110">
                  <Icon />
                </span>
                {label}
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <span className="h-5 w-px shrink-0 bg-white/20" />

          {/* Search bar */}
          <SearchBar className="w-full max-w-md flex-1" />
        </div>

        {/* ── Right: cart + user ── */}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <Link
            href="/gio-hang"
            aria-label="Giỏ hàng"
            className="relative flex h-10 items-center justify-center gap-2 rounded-full border border-transparent bg-transparent px-4 text-sm font-medium text-white/90 transition hover:border-white/25 hover:bg-white/15 hover:text-white"
          >
            <span className="relative">
              <IconCart />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#007e42]">
                  {itemCount}
                </span>
              )}
            </span>
            Giỏ hàng
          </Link>
          <UserMenu variant="desktop" />
        </div>

        {/* ── Hamburger — mobile ── */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 bg-white/15 text-white transition hover:bg-white/30 md:hidden"
          aria-expanded={menuOpen}
          aria-label="Mở menu điều hướng"
        >
          <IconMenu />
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="border-t border-[#005f32] bg-[#006838] md:hidden">
          <div className="mx-auto w-full max-w-7xl px-6 py-4">
            {/* Search */}
            <SearchBar className="mb-4 flex" />

            {/* Nav links */}
            <nav className="mb-4 flex flex-col gap-1">
              {leftLinks.map(({ label, href, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/15">
                    <Icon />
                  </span>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Link
                href="/gio-hang"
                onClick={() => setMenuOpen(false)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/25"
              >
                <IconCart />
                Giỏ hàng
                {itemCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-[#007e42]">
                    {itemCount}
                  </span>
                )}
              </Link>
              <UserMenu variant="mobile" onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
