"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchTechniqueDocs,
  getTechniqueContent,
  prettyDocTitle,
  sortByCanhTac,
} from "@/services/techniques";
import type { TechniqueDoc, TechniqueContent } from "@/types/technique";

/**
 * Tách khối text đã ghép thành các đoạn dễ đọc. Nội dung đã mất ranh giới đoạn
 * gốc (chunk làm phẳng \n\n thành space), nên gom theo câu: ~3 câu / đoạn.
 */
function toParagraphs(text: string): string[] {
  const sentences = text
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const paras: string[] = [];
  for (let i = 0; i < sentences.length; i += 3) {
    paras.push(sentences.slice(i, i + 3).join(" "));
  }
  return paras;
}

export default function KyThuatPage() {
  const [docs, setDocs] = useState<TechniqueDoc[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [content, setContent] = useState<TechniqueContent | null>(null);

  const [loadingList, setLoadingList] = useState(true);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── Tải danh sách tài liệu ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingList(true);
        const data = sortByCanhTac(await fetchTechniqueDocs());
        if (cancelled) return;
        setError(null);
        setDocs(data);
        if (data.length > 0) setActiveId(data[0].docId);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Không tải được danh sách tài liệu");
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Tải nội dung tài liệu đang chọn ── */
  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingDoc(true);
        const data = await getTechniqueContent(activeId);
        if (!cancelled) setContent(data);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Không tải được nội dung tài liệu");
      } finally {
        if (!cancelled) setLoadingDoc(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const selectDoc = (docId: string) => {
    setActiveId(docId);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Danh sách tài liệu (sidebar) ── */
  const DocList = (
    <nav className="space-y-1">
      {docs.map((d, i) => (
        <button
          key={d.docId}
          onClick={() => selectDoc(d.docId)}
          className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition ${
            activeId === d.docId
              ? "bg-emerald-50 font-bold text-[#007e42]"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-black ${
              activeId === d.docId
                ? "bg-[#007e42] text-white"
                : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
            }`}
          >
            {i + 1}
          </span>
          <span className="line-clamp-2">{prettyDocTitle(d.docTitle)}</span>
        </button>
      ))}
      {!loadingList && docs.length === 0 && (
        <p className="px-3 py-4 text-xs italic text-gray-400">Chưa có tài liệu nào.</p>
      )}
    </nav>
  );

  const paragraphs = content ? toParagraphs(content.content) : [];

  return (
    <div className="min-h-screen bg-[#e5e7eb] font-sans text-gray-800">
      {/* ── Tiêu đề tài liệu ── */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <nav className="mb-3 flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <Link href="/" className="hover:text-[#007e42]">Trang chủ</Link>
          <span>/</span>
          <span className="text-gray-700">Kỹ thuật canh tác lúa</span>
        </nav>
        <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">
          Cẩm nang kỹ thuật canh tác lúa
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-[15px]">
          Tài liệu hướng dẫn kỹ thuật từ làm đất, chọn giống, gieo sạ đến chăm sóc và
          thu hoạch. Chọn tài liệu ở danh sách bên trái để đọc.
        </p>
      </div>

      {/* ── Thân tài liệu ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 py-8 lg:py-10">

          {/* ── Sidebar (desktop) ── */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Tài liệu kỹ thuật
                </p>
                {loadingList ? (
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-8 animate-pulse rounded-lg bg-gray-100" />
                    ))}
                  </div>
                ) : (
                  DocList
                )}
              </div>
            </div>
          </aside>

          {/* ── Nội dung ── */}
          <main className="min-w-0 flex-1">

            {/* Nút mở danh sách (mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="mb-5 flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm lg:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
              </svg>
              Danh sách tài liệu
            </button>

            {/* Error */}
            {error && !loadingDoc && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-red-200 bg-white p-12 text-center">
                <h3 className="text-base font-extrabold text-gray-800">Không tải được tài liệu</h3>
                <p className="max-w-sm text-xs text-gray-400">{error}</p>
              </div>
            )}

            {/* Empty */}
            {!loadingList && !error && docs.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white p-16 text-center">
                <h3 className="text-base font-extrabold text-gray-800">Chưa có tài liệu kỹ thuật</h3>
                <p className="max-w-sm text-xs text-gray-400">Tài liệu sẽ hiển thị tại đây khi được thêm vào hệ thống.</p>
              </div>
            )}

            {/* Loading nội dung */}
            {loadingDoc && (
              <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="mb-6 h-7 w-1/2 rounded bg-gray-200" />
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-4 rounded bg-gray-100" style={{ width: `${85 + (i % 3) * 5}%` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Bài đọc */}
            {!loadingDoc && content && docs.length > 0 && (
              <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                {/* Thanh tiêu đề khối xanh */}
                <div className="bg-[#007e42] px-5 py-2.5 sm:px-6">
                  <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                    Tài liệu kỹ thuật
                  </div>
                  <h2 className="text-lg font-extrabold text-white sm:text-xl">
                    {prettyDocTitle(content.docTitle)}
                  </h2>
                </div>

                {/* Nội dung đọc */}
                <div className="p-6 sm:p-8">
                  <div className="space-y-4">
                    {paragraphs.map((p, i) => (
                      <p key={i} className="text-[15px] leading-7 text-gray-700">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </article>
            )}
          </main>
        </div>
      </div>

      {/* ── Drawer danh sách (mobile) ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="w-80 max-w-[85%] overflow-y-auto bg-white p-5">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-gray-800">Tài liệu kỹ thuật</h3>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-sm font-bold text-gray-500">
                Đóng ×
              </button>
            </div>
            {DocList}
          </div>
        </div>
      )}
    </div>
  );
}
