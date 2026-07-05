"use client";

import { useEffect, useRef, useState } from "react";
import { IChevronDown } from "@/components/icons";

/* ── Custom Select (dropdown tùy biến, đồng bộ với trang chủ) ── */
export default function CustomSelect<T extends string>({
  value,
  options,
  onChange,
  className = "",
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 outline-none transition hover:border-[#007e42] focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
      >
        <span>{current?.label}</span>
        <span className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}>
          <IChevronDown />
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 min-w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-emerald-50 ${o.value === value ? "bg-emerald-50 font-semibold text-[#007e42]" : "text-gray-700"}`}
            >
              <span>{o.label}</span>
              {o.value === value && <span className="text-[#007e42]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
