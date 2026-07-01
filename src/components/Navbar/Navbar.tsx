"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import UserMenu from "./UserMenu";
import { useCart } from "@/contexts/CartContext";
import { fetchProducts } from "@/services/products";
import { fmt } from "@/lib/format";
import type { Product } from "@/types/product";

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
      width={28}
      height={28}
      className="object-contain brightness-0 invert"
    />
  );
}

/** Chẩn đoán bệnh qua ảnh — icon camera quét */
function IconScan() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Kỹ thuật canh tác — icon sách/tài liệu */
function IconGuide() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    label: "Chẩn đoán bệnh lúa",
    href: "/chan-doan",
    Icon: IconScan,
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
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [phIndex, setPhIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

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

  // Gợi ý sản phẩm khi gõ — debounce 300ms, lấy tối đa 6 SP khớp tên.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      fetchProducts({ search: q, limit: 6 })
        .then((res) => setResults(res.data))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Bấm ra ngoài → đóng dropdown.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function goToSearch(q: string) {
    const value = q.trim();
    if (!value) return;
    setOpen(false);
    router.push(`/tim-kiem?q=${encodeURIComponent(value)}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    goToSearch(query);
  }

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="relative flex h-10 items-center rounded-full border border-transparent bg-white px-4 shadow-sm transition focus-within:ring-2 focus-within:ring-white/60"
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
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              setOpen(true);
            }}
            onBlur={() => setIsFocused(false)}
            className="relative z-10 h-full w-full bg-transparent text-sm font-medium text-[#007e42] outline-none"
            aria-label="Tìm kiếm"
          />
        </div>
      </form>

      {/* Dropdown gợi ý sản phẩm */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white text-gray-800 shadow-xl">
          {searching && results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">Đang tìm...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">
              Không tìm thấy sản phẩm nào khớp &laquo;{query.trim()}&raquo;
            </div>
          ) : (
            <>
              <ul className="max-h-96 overflow-y-auto py-1">
                {results.map((p) => (
                  <li key={p._id}>
                    <Link
                      href={`/san-pham/${p._id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 transition hover:bg-emerald-50"
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                        {p.images?.[0]?.url ? (
                          <Image
                            src={p.images[0].url}
                            alt={p.name}
                            fill
                            sizes="44px"
                            className="object-contain"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-700">{p.name}</p>
                        <p className="text-sm font-bold text-[#007e42]">
                          {fmt(p.price)}
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="ml-1.5 text-xs font-normal text-gray-400 line-through">
                              {fmt(p.originalPrice)}
                            </span>
                          )}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Xem tất cả kết quả */}
              <button
                type="button"
                onClick={() => goToSearch(query)}
                className="block w-full border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-center text-sm font-bold text-[#007e42] transition hover:bg-emerald-50"
              >
                Xem tất cả kết quả cho &laquo;{query.trim()}&raquo;
              </button>
            </>
          )}
        </div>
      )}
    </div>
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
      <div className="flex w-full items-center gap-4 px-4 py-3 sm:px-8 lg:px-16">

        {/* ── Logo ── */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5 lg:ml-20">
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

        {/* ── Left nav links ── */}
        <nav className="hidden shrink-0 items-center gap-1 md:flex">
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

        {/* ── Center: search (giãn lấp khoảng trống, giới hạn bề rộng tối đa) ── */}
        <div className="hidden min-w-55 max-w-sm flex-1 md:flex">
          <SearchBar className="w-full" />
        </div>

        {/* ── Right: cart + user ── */}
        <div className="mr-8 hidden shrink-0 items-center gap-2 md:flex lg:mr-20">
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
