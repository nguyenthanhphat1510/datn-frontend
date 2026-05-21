"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import type { Category, Product } from "@/types/product";
import { fetchCategories, fetchProducts } from "@/services/products";
import { ProductCard, ProductRow } from "@/components/home/ProductItem";
import { ILeaf, ISearch, IGrid, IList, IFilter, IHome } from "@/components/icons";
import PhanBonHero from "./PhanBonHero";

const PAGE_SIZE = 6;
const PRICE_MIN = 0;
const PRICE_MAX = 1_000_000;
const PHAN_BON_SLUG = "phan-bon";

type SortOption = "mac-dinh" | "gia-tang" | "gia-giam";
type ViewMode = "grid" | "list";

export default function PhanBonPage() {
  /* ── Catalog state ── */
  const [phanBonCategory, setPhanBonCategory] = useState<Category | null>(null);
  const [categoryLoaded, setCategoryLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Filter state ── */
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [sortBy, setSortBy] = useState<SortOption>("mac-dinh");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  /* ── Tìm category "Phân Bón" theo slug ── */
  useEffect(() => {
    fetchCategories()
      .then((cats) => {
        const found = cats.find((c) => c.slug === PHAN_BON_SLUG && c.isActive);
        setPhanBonCategory(found ?? null);
      })
      .catch(() => setPhanBonCategory(null))
      .finally(() => setCategoryLoaded(true));
  }, []);

  /* ── Fetch products với debounce ── */
  useEffect(() => {
    if (!categoryLoaded) return;
    if (!phanBonCategory) {
      setProducts([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      fetchProducts({
        page,
        limit: PAGE_SIZE,
        categoryId: phanBonCategory._id,
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
  }, [categoryLoaded, phanBonCategory, page, search, priceRange, reloadKey]);

  /* ── Client-side sort (page hiện tại) ── */
  const displayed = useMemo(() => {
    const arr = [...products];
    if (sortBy === "gia-tang") arr.sort((a, b) => a.price - b.price);
    else if (sortBy === "gia-giam") arr.sort((a, b) => b.price - a.price);
    return arr;
  }, [products, sortBy]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleClearFilters = () => {
    setSearch("");
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setSortBy("mac-dinh");
    setPage(1);
  };

  return (
    <div className="bg-gradient-to-b from-[#f9fcfb] to-[#f4f7f6] min-h-screen text-gray-800 pb-16 font-sans">
      {/* ── Hero Banner ── */}
      <PhanBonHero />

      {/* ── Catalog Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/" className="flex items-center gap-1 hover:text-[#007e42]">
            <IHome />
            <span>Trang chủ</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-[#007e42]">Phân bón</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar (desktop) */}
          <aside className="w-full lg:w-72 shrink-0 hidden lg:block space-y-5">
            {/* Search */}
            <div className="overflow-hidden rounded-xl border border-[#007e42]/15 bg-white shadow-md">
              <div className="px-4 py-2.5" style={{ background: "linear-gradient(135deg, #007e42 0%, #0a9d52 100%)" }}>
                <h3 className="text-sm font-bold text-white">Tìm kiếm</h3>
              </div>
              <div className="p-4">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <ISearch />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm font-medium text-gray-700 outline-none focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]"
                    placeholder="Tên sản phẩm..."
                  />
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="overflow-hidden rounded-xl border border-[#007e42]/15 bg-white shadow-md">
              <div className="px-4 py-2.5" style={{ background: "linear-gradient(135deg, #007e42 0%, #0a9d52 100%)" }}>
                <h3 className="text-sm font-bold text-white">Lọc theo giá</h3>
              </div>
              <div className="p-4 space-y-2">
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={20000}
                  value={priceRange[1]}
                  onChange={(e) => {
                    setPriceRange([priceRange[0], parseInt(e.target.value)]);
                    setPage(1);
                  }}
                  className="w-full accent-[#007e42] h-1.5 rounded bg-gray-200 appearance-none cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold">
                  <span>Dưới 1M VND</span>
                  <span className="text-[#007e42]">Tối đa: {priceRange[1].toLocaleString("vi-VN")} đ</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClearFilters}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold py-2.5 rounded-xl border border-gray-100 transition"
            >
              Thiết lập lại bộ lọc
            </button>
          </aside>

          {/* Mobile drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 lg:hidden flex justify-end" onClick={() => setMobileFiltersOpen(false)}>
              <div className="bg-white w-80 h-full p-6 overflow-y-auto space-y-5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b pb-4">
                  <h3 className="text-sm font-black text-gray-800">Bộ Lọc Phân Bón</h3>
                  <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-500 text-sm font-bold p-1">Đóng ×</button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Tìm kiếm</h4>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-gray-50 border rounded-xl py-2 px-3 text-xs"
                    placeholder="Nhập tên..."
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Giá tối đa</h4>
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={20000}
                    value={priceRange[1]}
                    onChange={(e) => {
                      setPriceRange([priceRange[0], parseInt(e.target.value)]);
                      setPage(1);
                    }}
                    className="w-full accent-[#007e42]"
                  />
                  <p className="text-[11px] text-[#007e42] font-bold">{priceRange[1].toLocaleString("vi-VN")} đ</p>
                </div>

                <button
                  onClick={() => {
                    handleClearFilters();
                    setMobileFiltersOpen(false);
                  }}
                  className="w-full bg-[#007e42] text-white text-xs font-bold py-2.5 rounded-xl"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          )}

          {/* Main */}
          <div className="flex-1 flex flex-col gap-5 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl"
                >
                  <IFilter />
                  Lọc
                </button>

                <p className="text-xs font-bold text-gray-400">
                  Hiển thị{" "}
                  <span className="text-gray-800">
                    {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
                  </span>{" "}
                  trong số <span className="text-gray-800">{total}</span> sản phẩm
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="bg-gray-50 border border-gray-100 p-0.5 rounded-xl flex">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition ${viewMode === "grid" ? "bg-white text-[#007e42] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                    title="Lưới"
                  >
                    <IGrid />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition ${viewMode === "list" ? "bg-white text-[#007e42] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                    title="Danh sách"
                  >
                    <IList />
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-[#007e42]"
                >
                  <option value="mac-dinh">Sắp xếp: Mặc định</option>
                  <option value="gia-tang">Giá tăng dần</option>
                  <option value="gia-giam">Giá giảm dần</option>
                </select>
              </div>
            </div>

            {/* Error */}
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

            {/* Loading */}
            {loading && !error && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="h-80 animate-pulse rounded-xl border border-gray-100 bg-gray-50" />
                ))}
              </div>
            )}

            {/* Category not found */}
            {!loading && !error && categoryLoaded && !phanBonCategory && (
              <div className="bg-white rounded-2xl p-16 border border-dashed border-gray-200 text-center flex flex-col items-center gap-3">
                <ILeaf size={40} />
                <h3 className="font-extrabold text-gray-800 text-base">Chưa có danh mục &ldquo;Phân bón&rdquo;</h3>
                <p className="text-xs text-gray-400 max-w-sm">
                  Vui lòng tạo danh mục với slug <code className="bg-gray-100 px-1 rounded">phan-bon</code> trong trang quản trị.
                </p>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && phanBonCategory && total === 0 && (
              <div className="bg-white rounded-2xl p-16 border border-dashed border-gray-200 text-center flex flex-col items-center gap-3">
                <ILeaf size={40} />
                <h3 className="font-extrabold text-gray-800 text-base">Không tìm thấy sản phẩm phù hợp</h3>
                <p className="text-xs text-gray-400 max-w-sm">Hãy thử thay đổi điều kiện lọc, khoảng giá hoặc từ khóa.</p>
                <button
                  onClick={handleClearFilters}
                  className="bg-[#007e42] hover:bg-[#005f32] text-white text-xs font-bold px-4 py-2 rounded-xl mt-2 transition"
                >
                  Xóa bộ lọc để thử lại
                </button>
              </div>
            )}

            {/* Grid */}
            {!loading && !error && total > 0 && viewMode === "grid" && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {displayed.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}

            {/* List */}
            {!loading && !error && total > 0 && viewMode === "list" && (
              <div className="flex flex-col gap-3">
                {displayed.map((p) => (
                  <ProductRow key={p._id} product={p} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:border-[#007e42] hover:text-[#007e42] transition disabled:opacity-40"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-black transition ${n === page ? "border-[#007e42] bg-[#007e42] text-white" : "border-gray-200 text-gray-600 hover:border-[#007e42] hover:text-[#007e42]"}`}
                    >
                      {n}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:border-[#007e42] hover:text-[#007e42] transition disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
