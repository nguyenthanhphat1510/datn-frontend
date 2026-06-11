"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import type { Category, Product } from "@/types/product";
import { fetchCategories, fetchProducts } from "@/services/products";
import { fmt } from "@/lib/format";
import { Stars } from "@/components/Stars";
import {
  IChevronDown,
  IFilter,
  IGrid,
  IHome,
  IList,
  ILeaf,
} from "@/components/icons";
import { ProductCard, ProductRow } from "./ProductItem";

type SortOption = "mac-dinh" | "gia-tang" | "gia-giam" | "moi-nhat";
type ViewMode = "grid" | "list";

const PAGE_SIZE = 8;
const PRICE_MIN = 0;
const PRICE_MAX = 1_000_000;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "mac-dinh", label: "Mặc định" },
  { value: "gia-tang", label: "Giá tăng dần" },
  { value: "gia-giam", label: "Giá giảm dần" },
  { value: "moi-nhat", label: "Mới nhất" },
];

const ALL_CATEGORY = "all";

/* ── Pagination helper ── */
function getPaginationItems(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "...")[] = [1];
  if (current > 3) items.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) items.push(i);
  if (current < total - 2) items.push("...");
  items.push(total);
  return items;
}

/* ── Custom Select ── */
function CustomSelect<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
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
    <div ref={ref} className="relative">
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
        <div className="absolute right-0 top-full z-30 mt-1 min-w-[160px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
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

/* ── Price Range Slider ── */
function PriceSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const STEP = 10000;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const [draftMin, setDraftMin] = useState(String(value[0]));
  const [draftMax, setDraftMax] = useState(String(value[1]));

  useEffect(() => {
    setDraftMin(String(value[0]));
    setDraftMax(String(value[1]));
  }, [value]);

  const commit = (which: "min" | "max", raw: string) => {
    const n = parseInt(raw.replace(/\D/g, ""), 10);
    if (Number.isNaN(n)) {
      setDraftMin(String(value[0]));
      setDraftMax(String(value[1]));
      return;
    }
    if (which === "min") {
      const clamped = Math.max(min, Math.min(n, value[1] - STEP));
      onChange([clamped, value[1]]);
    } else {
      const clamped = Math.min(max, Math.max(n, value[0] + STEP));
      onChange([value[0], clamped]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative h-1.5 rounded-full bg-gray-200">
        <div
          className="absolute h-full rounded-full bg-[#007e42]"
          style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={STEP}
          value={value[0]}
          onChange={(e) => {
            const v = Math.min(+e.target.value, value[1] - STEP);
            onChange([v, value[1]]);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={STEP}
          value={value[1]}
          onChange={(e) => {
            const v = Math.max(+e.target.value, value[0] + STEP);
            onChange([value[0], v]);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#007e42] bg-white shadow" style={{ left: `${pct(value[0])}%` }} />
          <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#007e42] bg-white shadow" style={{ left: `${pct(value[1])}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400">Từ</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={Number(draftMin).toLocaleString("vi-VN")}
              onChange={(e) => setDraftMin(e.target.value)}
              onBlur={() => commit("min", draftMin)}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="h-8 w-full rounded-md border border-gray-200 bg-white pl-2 pr-6 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">₫</span>
          </div>
        </div>
        <span className="mt-4 text-gray-300">—</span>
        <div className="flex-1">
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400">Đến</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={Number(draftMax).toLocaleString("vi-VN")}
              onChange={(e) => setDraftMax(e.target.value)}
              onBlur={() => commit("max", draftMax)}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="h-8 w-full rounded-md border border-gray-200 bg-white pl-2 pr-6 text-sm text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">₫</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar content ── */
function SidebarContent({
  categories,
  activeCategory,
  setActiveCategory,
  priceRange,
  setPriceRange,
  newest,
}: {
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
  newest: Product[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Danh mục */}
      <div className="overflow-hidden rounded-xl border border-[#007e42]/15 bg-white shadow-md">
        <div className="px-4 py-3" style={{ background: "linear-gradient(135deg, #007e42 0%, #0a9d52 100%)" }}>
          <h3 className="text-base font-bold text-white">Danh mục</h3>
        </div>
        <ul className="flex flex-col gap-1 p-2">
          <li>
            <button
              onClick={() => setActiveCategory(ALL_CATEGORY)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition text-left ${activeCategory === ALL_CATEGORY ? "bg-emerald-50 text-[#007e42]" : "hover:bg-gray-50 text-gray-600"}`}
            >
              <span>Tất cả</span>
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat._id}>
              <button
                onClick={() => setActiveCategory(cat._id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition text-left ${activeCategory === cat._id ? "bg-emerald-50 text-[#007e42]" : "hover:bg-gray-50 text-gray-600"}`}
              >
                <span className="text-left">{cat.name}</span>
              </button>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="px-3 py-2 text-xs text-gray-400">Chưa có danh mục</li>
          )}
        </ul>
      </div>

      {/* Lọc theo giá */}
      <div className="overflow-hidden rounded-xl border border-[#007e42]/15 bg-white shadow-md">
        <div className="px-4 py-3" style={{ background: "linear-gradient(135deg, #007e42 0%, #0a9d52 100%)" }}>
          <h3 className="text-base font-bold text-white">Lọc theo giá</h3>
        </div>
        <div className="p-4">
          <PriceSlider min={PRICE_MIN} max={PRICE_MAX} value={priceRange} onChange={setPriceRange} />
        </div>
      </div>

      {/* Sản phẩm mới nhất */}
      <div className="overflow-hidden rounded-xl border border-[#007e42]/15 bg-white shadow-md">
        <div className="px-4 py-3" style={{ background: "linear-gradient(135deg, #007e42 0%, #0a9d52 100%)" }}>
          <h3 className="text-base font-bold text-white">Sản phẩm mới nhất</h3>
        </div>
        <ul className="divide-y divide-gray-50 p-3">
          {newest.map((p) => (
            <li key={p._id} className="flex items-center gap-2.5 py-2.5 first:pt-0 last:pb-0">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-emerald-50 overflow-hidden">
                {p.images?.[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <ILeaf size={34} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/san-pham/${p._id}`} className="line-clamp-2 text-xs font-medium text-gray-700 hover:text-[#007e42]">
                  {p.name}
                </Link>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs font-bold text-[#007e42]">{fmt(p.price)}</p>
                  {p.rating ? <Stars rating={p.rating} /> : null}
                </div>
              </div>
            </li>
          ))}
          {newest.length === 0 && (
            <li className="px-1 py-2 text-xs text-gray-400">Chưa có sản phẩm</li>
          )}
        </ul>
      </div>
    </div>
  );
}

/* ── Main ProductList ── */
export default function ProductList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [newest, setNewest] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [sort, setSort] = useState<SortOption>("mac-dinh");
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Fetch categories + newest once on mount
  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories(cats.filter((c) => c.isActive)))
      .catch(() => setCategories([]));

    fetchProducts({ limit: 3, page: 1 })
      .then((res) => setNewest(res.data))
      .catch(() => setNewest([]));
  }, []);

  // Fetch products on filter change (with search debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      fetchProducts({
        page,
        limit: PAGE_SIZE,
        categoryId: activeCategory !== ALL_CATEGORY ? activeCategory : undefined,
        search: search.trim() || undefined,
        minPrice: priceRange[0] > PRICE_MIN ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < PRICE_MAX ? priceRange[1] : undefined,
      })
        .then((res) => {
          setProducts(res.data);
          setTotal(res.total);
        })
        .catch((err: Error) => {
          setError(err.message || "Không thể tải sản phẩm");
          setProducts([]);
          setTotal(0);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [activeCategory, priceRange, search, page, reloadKey]);

  // Client-side sort (page only)
  const displayed = useMemo(() => {
    const arr = [...products];
    if (sort === "gia-tang") arr.sort((a, b) => a.price - b.price);
    else if (sort === "gia-giam") arr.sort((a, b) => b.price - a.price);
    // "mac-dinh" và "moi-nhat" đều dùng order backend (createdAt DESC)
    return arr;
  }, [products, sort]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageItems = getPaginationItems(page, totalPages);

  const activeCategoryName = useMemo(() => {
    if (activeCategory === ALL_CATEGORY) return null;
    return categories.find((c) => c._id === activeCategory)?.name ?? null;
  }, [activeCategory, categories]);

  const handleCategoryChange = useCallback((c: string) => {
    setActiveCategory(c);
    setPage(1);
  }, []);

  const resetFilters = () => {
    setActiveCategory(ALL_CATEGORY);
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setSearch("");
    setSort("mac-dinh");
    setPage(1);
  };

  return (
    <section className="relative w-full min-h-screen bg-[#e5e7eb] px-4 py-10 sm:px-6 lg:px-10">
      <div className="absolute inset-0 -z-10 opacity-[0.02] bg-[radial-gradient(rgba(0,126,66,0.4)_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="mx-auto max-w-370">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/" className="flex items-center gap-1 hover:text-[#007e42]">
            <IHome />
            <span>Trang chủ</span>
          </Link>
          <span className="text-gray-300">/</span>
          <Link href="/san-pham" className="hover:text-[#007e42]">Sản phẩm</Link>
          {activeCategoryName && (
            <>
              <span className="text-gray-300">/</span>
              <span className="font-semibold text-[#007e42]">{activeCategoryName}</span>
            </>
          )}
        </nav>

        {/* Section Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#007e42]/20 bg-emerald-50 px-4 py-1.5 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#007e42] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#007e42]">
              Vật tư nông nghiệp
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">
            Sản phẩm{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #007e42, #0a9d52, #84cc16)" }}
            >
              nổi bật
            </span>
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">
            Tuyển chọn các sản phẩm chất lượng cao, phù hợp với từng giai đoạn sinh trưởng của cây trồng
          </p>
          <div className="mt-4 mx-auto h-[3px] w-20 rounded-full" style={{ background: "linear-gradient(90deg, #007e42, #84cc16, #fde68a)" }} />
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block w-64 shrink-0">
            <SidebarContent
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={handleCategoryChange}
              priceRange={priceRange}
              setPriceRange={(v) => {
                setPriceRange(v);
                setPage(1);
              }}
              newest={newest}
            />
          </aside>

          {/* Sidebar (mobile drawer) */}
          {drawerOpen && (
            <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setDrawerOpen(false)}>
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
              <div
                className="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-gray-50 p-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-800">Bộ lọc</h3>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200"
                  >
                    ✕
                  </button>
                </div>
                <SidebarContent
                  categories={categories}
                  activeCategory={activeCategory}
                  setActiveCategory={(c) => {
                    handleCategoryChange(c);
                    setDrawerOpen(false);
                  }}
                  priceRange={priceRange}
                  setPriceRange={(v) => {
                    setPriceRange(v);
                    setPage(1);
                  }}
                  newest={newest}
                />
              </div>
            </div>
          )}

          {/* Main */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3.5 text-sm font-medium text-gray-600 lg:hidden hover:border-[#007e42] hover:text-[#007e42]"
              >
                <IFilter />
                <span>Bộ lọc</span>
              </button>

              <div className="flex-1 min-w-[180px]">
                {!error && (
                  <p className="text-sm text-gray-500">
                    Hiển thị{" "}
                    <span className="font-semibold text-gray-800">
                      {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
                      {Math.min(page * PAGE_SIZE, total)}
                    </span>{" "}
                    của <span className="font-semibold text-gray-800">{total}</span> kết quả
                  </p>
                )}
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => setView("grid")}
                  title="Lưới"
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${view === "grid" ? "bg-[#007e42] text-white" : "text-gray-400 hover:bg-gray-100"}`}
                >
                  <IGrid />
                </button>
                <button
                  onClick={() => setView("list")}
                  title="Danh sách"
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${view === "list" ? "bg-[#007e42] text-white" : "text-gray-400 hover:bg-gray-100"}`}
                >
                  <IList />
                </button>
              </div>

              <CustomSelect<SortOption>
                value={sort}
                options={SORT_OPTIONS}
                onChange={(v) => setSort(v)}
              />
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span>⚠ {error}</span>
                <button
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Loading / empty / list */}
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div
                    key={i}
                    className="h-96 animate-pulse rounded-xl border border-gray-300/50 bg-white/40"
                  />
                ))}
              </div>
            ) : !error && total === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
                <ILeaf size={48} />
                <p className="mt-3 text-base font-semibold text-gray-600">Không có sản phẩm nào phù hợp</p>
                <p className="text-sm text-gray-400">Thử điều chỉnh bộ lọc hoặc xoá tìm kiếm</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 rounded-lg bg-[#007e42] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0a9d52]"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : view === "grid" ? (
              <div
                key={`grid-${page}-${activeCategory}-${sort}-${search}`}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-[fadeInUp_0.35s_ease-out]"
              >
                {displayed.map((p, i) => (
                  <div
                    key={p._id}
                    className="animate-[fadeInUp_0.4s_ease-out_both]"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            ) : (
              <div
                key={`list-${page}-${activeCategory}-${sort}-${search}`}
                className="flex flex-col gap-3 animate-[fadeInUp_0.35s_ease-out]"
              >
                {displayed.map((p, i) => (
                  <div
                    key={p._id}
                    className="animate-[fadeInUp_0.4s_ease-out_both]"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <ProductRow product={p} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && !error && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-500 transition hover:border-[#007e42] hover:text-[#007e42] disabled:opacity-40"
                >
                  ‹
                </button>
                {pageItems.map((it, i) =>
                  it === "..." ? (
                    <span key={`e-${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={it}
                      onClick={() => setPage(it)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition ${
                        it === page
                          ? "border-[#007e42] bg-[#007e42] text-white"
                          : "border-gray-200 text-gray-600 hover:border-[#007e42] hover:text-[#007e42]"
                      }`}
                    >
                      {it}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-500 transition hover:border-[#007e42] hover:text-[#007e42] disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
