"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

function IconUser() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function IconAccount() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function IconOrders() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

interface Props {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}

export default function UserMenu({ variant, onNavigate }: Props) {
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (loading) {
    // Skeleton để tránh nháy giữa "Đăng nhập" và user menu khi reload
    if (variant === "desktop") {
      return <div className="h-10 w-28 animate-pulse rounded-full bg-white/15" />;
    }
    return <div className="h-9 flex-1 animate-pulse rounded-lg bg-white/15" />;
  }

  if (!user) {
    if (variant === "desktop") {
      return (
        <Link
          href="/dang-nhap"
          aria-label="Đăng nhập"
          className="flex h-10 items-center justify-center gap-2 rounded-full border border-transparent bg-transparent px-4 text-sm font-medium text-white/90 transition hover:border-white/25 hover:bg-white/15 hover:text-white"
        >
          <IconUser />
          Đăng nhập
        </Link>
      );
    }
    return (
      <Link
        href="/dang-nhap"
        onClick={onNavigate}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#007e42] transition hover:bg-green-50"
      >
        <IconUser />
        Đăng nhập
      </Link>
    );
  }

  const displayName = user.fullName || user.email.split("@")[0];
  const initial = (user.fullName?.[0] || user.email[0] || "U").toUpperCase();

  function handleLogout() {
    logout();
    setOpen(false);
    onNavigate?.();
  }

  if (variant === "mobile") {
    return (
      <div className="flex w-full flex-col gap-1 rounded-lg bg-white/10 p-2">
        <div className="flex items-center gap-2 px-2 py-1.5 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-[#007e42]">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-[11px] text-white/70">{user.email}</p>
          </div>
        </div>
        <Link
          href="/tai-khoan"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-white/90 transition hover:bg-white/15"
        >
          <IconAccount />
          Tài khoản của tôi
        </Link>
        <Link
          href="/don-hang"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-white/90 transition hover:bg-white/15"
        >
          <IconOrders />
          Đơn hàng của tôi
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-semibold text-red-200 transition hover:bg-white/15"
        >
          <IconLogout />
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-full border border-transparent bg-transparent px-3 text-sm font-medium text-white/90 transition hover:border-white/25 hover:bg-white/15 hover:text-white"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-[#007e42]">
          {initial}
        </span>
        <span className="max-w-[120px] truncate">{displayName}</span>
        <IconChevron open={open} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5"
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-gray-900">
              {displayName}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
          <div className="py-1">
            <Link
              href="/tai-khoan"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 transition hover:bg-[#f1f7f3] hover:text-[#007e42]"
            >
              <IconAccount />
              Tài khoản của tôi
            </Link>
            <Link
              href="/don-hang"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 transition hover:bg-[#f1f7f3] hover:text-[#007e42]"
            >
              <IconOrders />
              Đơn hàng của tôi
            </Link>
          </div>
          <div className="border-t border-gray-100 py-1">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <IconLogout />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
