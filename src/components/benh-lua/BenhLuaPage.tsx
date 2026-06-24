"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchDiseases } from "@/services/diseases";
import { getProduct } from "@/services/products";
import type { Disease } from "@/types/disease";
import type { Product } from "@/types/product";

/** Ảnh fallback khi bệnh chưa có ảnh trên Cloudinary lẫn ảnh local. */
const FALLBACK_IMG = "/la_lua.png";

/** Ảnh minh họa local theo slug bệnh (đặt trong /public). */
const DISEASE_IMAGE_BY_SLUG: Record<string, string> = {
  "dao-on-la": "/dao-on-lua.png",
  "dao-on-co-bong": "/dao_on_co_bong.png",
  "bac-la-chay-bia-la": "/chay_bia_la.jpg",
  "lem-lep-hat": "/lem_lep_hat.jpg",
  "vang-lun-lun-xoan-la": "/benh_vang_lun.jpg",
  "dom-nau": "/dom-nau-tren-lua.jpg",
};

export default function BenhLuaPage() {
  /* ── Data ── */
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── UI state ── */
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer

  /* ── Thuốc gợi ý: map theo từng bệnh ── */
  const [recProducts, setRecProducts] = useState<Record<string, Product[]>>({});

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  /* ── Tải danh sách bệnh từ backend ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchDiseases();
        if (cancelled) return;
        setError(null);
        setDiseases(data);
        if (data.length > 0) setActiveId(data[0]._id);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Không tải được danh sách bệnh");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Tải thuốc gợi ý cho tất cả bệnh (gộp ID, fetch 1 lần) ── */
  useEffect(() => {
    if (diseases.length === 0) return;
    let cancelled = false;
    (async () => {
      const allIds = Array.from(
        new Set(diseases.flatMap((d) => d.recommendedProductIds ?? [])),
      );
      if (allIds.length === 0) return;
      const results = await Promise.allSettled(allIds.map((id) => getProduct(id)));
      if (cancelled) return;
      const byId: Record<string, Product> = {};
      results.forEach((r) => {
        if (r.status === "fulfilled") byId[r.value._id] = r.value;
      });
      const map: Record<string, Product[]> = {};
      diseases.forEach((d) => {
        map[d._id] = (d.recommendedProductIds ?? [])
          .map((id) => byId[id])
          .filter(Boolean);
      });
      setRecProducts(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [diseases]);

  /* ── Lọc danh sách theo search (chỉ ảnh hưởng mục lục) ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return diseases;
    return diseases.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.description ?? "").toLowerCase().includes(q) ||
        d.symptoms.some((s) => s.toLowerCase().includes(q)),
    );
  }, [diseases, search]);

  /* ── Theo dõi section nào đang trong viewport để highlight mục lục ── */
  useEffect(() => {
    if (filtered.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id.replace("benh-", ""));
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    filtered.forEach((d) => {
      const el = sectionRefs.current[d._id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [filtered]);

  const scrollTo = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const diseaseImg = (d: Disease) =>
    d.images?.[0]?.url || DISEASE_IMAGE_BY_SLUG[d.slug] || FALLBACK_IMG;

  /* ── Mục lục (sidebar nội dung) ── */
  const TableOfContents = (
    <nav className="space-y-1">
      {filtered.map((d, i) => (
        <button
          key={d._id}
          onClick={() => scrollTo(d._id)}
          className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition ${
            activeId === d._id
              ? "bg-emerald-50 font-bold text-[#007e42]"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-black ${
              activeId === d._id
                ? "bg-[#007e42] text-white"
                : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
            }`}
          >
            {i + 1}
          </span>
          <span className="line-clamp-1">{d.name}</span>
        </button>
      ))}
      {filtered.length === 0 && (
        <p className="px-3 py-4 text-xs italic text-gray-400">Không có bệnh phù hợp.</p>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#e5e7eb] font-sans text-gray-800">
      {/* ── Tiêu đề tài liệu ── */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <nav className="mb-3 flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <Link href="/" className="hover:text-[#007e42]">Trang chủ</Link>
          <span>/</span>
          <span className="text-gray-700">Cẩm nang bệnh hại lúa</span>
        </nav>
        <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">
          Cẩm nang bệnh hại cây lúa
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-[15px]">
          Tài liệu nhận diện triệu chứng, nguyên nhân và biện pháp phòng trị các bệnh
          thường gặp trên cây lúa. Dùng mục lục bên trái để chuyển nhanh giữa các bệnh.
        </p>
      </div>

      {/* ── Thân tài liệu ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 py-8 lg:py-10">

          {/* ── Sidebar mục lục (desktop) ── */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] space-y-4 overflow-y-auto">
              <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Mục lục
                </p>
                {TableOfContents}
              </div>
            </div>
          </aside>

          {/* ── Nội dung ── */}
          <main className="min-w-0 flex-1">

            {/* Thanh mở mục lục (mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="mb-5 flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm lg:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
              </svg>
              Mục lục bệnh
            </button>

            {/* Loading */}
            {loading && (
              <div className="space-y-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6">
                    <div className="mb-4 h-6 w-1/3 rounded bg-gray-200" />
                    <div className="mb-2 h-3 w-full rounded bg-gray-100" />
                    <div className="mb-2 h-3 w-5/6 rounded bg-gray-100" />
                    <div className="h-40 w-full rounded-xl bg-gray-100" />
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-red-200 bg-white p-12 text-center">
                <h3 className="text-base font-extrabold text-gray-800">Không tải được dữ liệu bệnh</h3>
                <p className="max-w-sm text-xs text-gray-400">{error}</p>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && diseases.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white p-16 text-center">
                <h3 className="text-base font-extrabold text-gray-800">Chưa có dữ liệu bệnh</h3>
                <p className="max-w-sm text-xs text-gray-400">Dữ liệu bệnh lúa sẽ hiển thị tại đây khi được thêm vào hệ thống.</p>
              </div>
            )}

            {/* Các section bệnh */}
            {!loading && !error && diseases.length > 0 && (
              <div className="space-y-12">
                {filtered.map((d, i) => {
                  const recs = recProducts[d._id] ?? [];
                  return (
                    <article
                      key={d._id}
                      id={`benh-${d._id}`}
                      ref={(el) => {
                        sectionRefs.current[d._id] = el;
                      }}
                      className="scroll-mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                    >
                      {/* Thanh tiêu đề khối xanh */}
                      <div className="flex items-center gap-2.5 bg-[#007e42] px-5 py-2.5 sm:px-6">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/25 text-[11px] font-black text-white">
                          {i + 1}
                        </span>
                        <h2 className="text-base font-extrabold text-white sm:text-lg">
                          {d.name}
                        </h2>
                      </div>

                      {/* Nội dung bệnh */}
                      <div className="p-6 sm:p-8">

                      {/* Ảnh minh họa */}
                      <figure className="mb-6 overflow-hidden rounded-xl border border-gray-100">
                        <div className="relative h-72 w-full bg-gradient-to-br from-[#ebf5ef] to-[#cce8d9] sm:h-[28rem]">
                          <Image
                            src={diseaseImg(d)}
                            alt={d.name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 720px"
                            className="object-cover"
                          />
                        </div>
                        <figcaption className="bg-gray-200 px-4 py-2 text-[11px] italic text-gray-500">
                          Hình ảnh minh họa: {d.name}
                        </figcaption>
                      </figure>

                      {/* Mô tả / nguyên nhân */}
                      {d.description && (
                        <section className="mb-6">
                          <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-gray-900">
                            <span className="h-4 w-1 rounded-full bg-[#007e42]" />
                            Mô tả &amp; nguyên nhân
                          </h3>
                          <p className="text-[15px] leading-7 text-gray-700">{d.description}</p>
                        </section>
                      )}

                      {/* Triệu chứng */}
                      {d.symptoms.length > 0 && (
                        <section className="mb-6">
                          <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
                            <span className="h-4 w-1 rounded-full bg-[#007e42]" />
                            Triệu chứng nhận biết
                          </h3>
                          <ul className="space-y-2">
                            {d.symptoms.map((s) => (
                              <li key={s} className="flex items-start gap-2.5 text-[15px] leading-6 text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mt-1 shrink-0 text-[#007e42]" viewBox="0 0 16 16">
                                  <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
                                </svg>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {/* Thuốc gợi ý — khối nhỏ cuối bệnh */}
                      {recs.length > 0 && (
                        <section className="mt-6 rounded-xl border border-gray-200 bg-[#e5e7eb] p-4">
                          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#007e42]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
                            </svg>
                            Thuốc đặc trị gợi ý
                          </h3>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {recs.map((p) => (
                              <Link
                                key={p._id}
                                href={`/san-pham/${p._id}`}
                                className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#007e42] hover:shadow-lg"
                              >
                                {/* Ảnh trên */}
                                <div className="relative aspect-square w-full bg-white">
                                  <Image
                                    src={p.images?.[0]?.url || "/thuoc.png"}
                                    alt={p.name}
                                    fill
                                    sizes="(max-width: 640px) 50vw, 180px"
                                    className="object-contain p-3 transition duration-300 group-hover:scale-110"
                                  />
                                </div>
                                {/* Thông tin dưới */}
                                <div className="flex flex-1 flex-col p-3">
                                  <p className="line-clamp-2 text-[13px] font-bold leading-snug text-gray-800 transition group-hover:text-[#007e42]">
                                    {p.name}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                          <Link
                            href="/thuoc-bvtv"
                            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#007e42] hover:underline"
                          >
                            Xem thêm thuốc bảo vệ thực vật →
                          </Link>
                        </section>
                      )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Drawer mục lục (mobile) ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="w-80 max-w-[85%] overflow-y-auto bg-white p-5">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-gray-800">Mục lục bệnh</h3>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-sm font-bold text-gray-500">
                Đóng ×
              </button>
            </div>
            <div className="relative mb-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm bệnh, triệu chứng..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#007e42]"
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="absolute left-3 top-3 text-gray-400" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.11-.11zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
            </div>
            {TableOfContents}
          </div>
        </div>
      )}
    </div>
  );
}
