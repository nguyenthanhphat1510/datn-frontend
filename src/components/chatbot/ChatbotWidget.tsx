"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { fmt } from "@/lib/format";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type Diagnosis = {
  disease: string;       // tên bệnh dự đoán
  confidence: number;    // độ tin cậy 0-100
  cause: string;         // nguyên nhân / mô tả ngắn
};

type ProductCard = {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
};

type Message = {
  id: number;
  role: "bot" | "user";
  text?: string;
  time: string;
  diagnosis?: Diagnosis;        // khối chẩn đoán bệnh (nếu có)
  products?: ProductCard[];     // danh sách sản phẩm gợi ý (nếu có)
};

/* ─────────────────────────────────────────
   SVG Icons
───────────────────────────────────────── */
function IconClose() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

/** Lá cây — gợi ý tư vấn phân bón */
function IconLeaf() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  );
}

/** Lọ thuốc — gợi ý thuốc trị sâu bệnh */
function IconBug() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m8 2 1.88 1.88M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6Z" />
      <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  );
}

/** Avatar bot — dùng ảnh /chatbot.png trong public. */
function BotAvatar({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/chatbot.png"
      alt="Trợ lý ảo TP Agri"
      width={56}
      height={56}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

/* ─────────────────────────────────────────
   Dữ liệu mẫu (chưa call API)
───────────────────────────────────────── */
const sampleMessages: Message[] = [
  {
    id: 1,
    role: "bot",
    text: "Xin chào! Mình là trợ lý ảo của TP Agri 🌾. Bạn mô tả triệu chứng trên cây lúa, mình sẽ dự đoán bệnh và gợi ý sản phẩm phù hợp nhé!",
    time: "09:00",
  },
  {
    id: 2,
    role: "user",
    text: "Lá lúa của mình có vết hình thoi màu nâu xám, viền nâu đậm, lan rộng làm cháy lá. Đây là bệnh gì vậy?",
    time: "09:01",
  },
  {
    id: 3,
    role: "bot",
    text: "Dựa trên mô tả, mình dự đoán cây lúa của bạn đang bị:",
    time: "09:01",
    diagnosis: {
      disease: "Bệnh đạo ôn lá",
      confidence: 92,
      cause: "Do nấm Pyricularia oryzae. Vết bệnh hình thoi, tâm xám, viền nâu — gặp nhiều khi ẩm độ cao, bón thừa đạm.",
    },
  },
  {
    id: 4,
    role: "bot",
    text: "Bạn nên phun thuốc đặc trị đạo ôn càng sớm càng tốt. Một số sản phẩm phù hợp:",
    time: "09:01",
    products: [
      {
        id: 301,
        name: "Filia® 525SE đặc trị đạo ôn",
        image: "/thuoc.png",
        price: 120000,
        originalPrice: 145000,
      },
      {
        id: 302,
        name: "Beam® 75WP trừ nấm đạo ôn",
        image: "/thuoc.png",
        price: 38000,
      },
      {
        id: 303,
        name: "Phân bón lá tăng đề kháng Amino",
        image: "/phanbon.png",
        price: 52000,
        originalPrice: 60000,
      },
    ],
  },
];

const quickReplies = [
  "Tư vấn phân bón",
  "Thuốc trị sâu bệnh",
  "Liên hệ nhân viên",
];

/* Gợi ý hiển thị ngoài nút — kèm icon, xếp nhỏ dần từ trên xuống (kiểu bậc thang) */
const hintSuggestions = [
  { Icon: IconLeaf, label: "Tư vấn phân bón" },
  { Icon: IconBug, label: "Thuốc trị sâu bệnh" },
];

/* Mỗi cấp nhỏ dần một chút: chiều rộng, padding, cỡ chữ */
const hintTiers = [
  "w-[150px] px-2.5 py-1 text-xs",
  "w-[132px] px-2.5 py-1 text-[11px]",
];

/* ─────────────────────────────────────────
   Chatbot Widget
───────────────────────────────────────── */
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Tự cuộn xuống cuối khi có tin nhắn mới hoặc khi mở
  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, open]);

  function nowTime() {
    return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }

  function handleSend(text: string) {
    const value = text.trim();
    if (!value) return;
    // TODO: call API xử lý ở đây. Hiện chỉ append tin nhắn user để xem layout.
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: value, time: nowTime() },
    ]);
    setInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSend(input);
  }

  return (
    <>
      {/* ── Gợi ý nổi phía trên nút (khi chưa mở chat) — thẻ nhỏ dần kiểu bậc thang ── */}
      {!open && hintOpen && (
        <div className="fixed bottom-24 right-5 z-[60] flex flex-col items-end gap-2">
          {/* Lời chào + nút đóng */}
          <div
            className="relative w-[172px] rounded-2xl rounded-br-md bg-[#f0f8f3] px-3 py-2 shadow-lg ring-1 ring-[#007e42]/20"
            style={{ animation: "slideUpFade 0.35s ease both" }}
          >
            <button
              type="button"
              onClick={() => setHintOpen(false)}
              aria-label="Đóng gợi ý"
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-600 shadow transition hover:bg-gray-300"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <p className="text-xs font-bold text-[#007e42]">Xin chào! 👋</p>
            <p className="mt-0.5 text-[11px] text-gray-600">Mình có thể giúp gì cho bạn?</p>
          </div>

          {/* Các thẻ gợi ý — nhỏ dần từ trên xuống, căn lề phải về phía nút */}
          {hintSuggestions.map(({ Icon, label }, i) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setOpen(true);
                setHintOpen(false);
                handleSend(label);
              }}
              style={{ animation: `slideUpFade 0.35s ease both`, animationDelay: `${0.06 * (i + 1)}s` }}
              className={`group flex items-center gap-2.5 rounded-full bg-white font-semibold text-[#007e42] shadow-md ring-1 ring-[#007e42]/25 transition hover:-translate-x-0.5 hover:bg-[#007e42] hover:text-white hover:ring-[#007e42] ${hintTiers[i] ?? hintTiers[hintTiers.length - 1]}`}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#007e42]/10 text-[#007e42] transition group-hover:bg-white/20 group-hover:text-white">
                <Icon />
              </span>
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Floating button ── */}
      <div className="fixed bottom-5 right-5 z-[60]">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Đóng trợ lý ảo" : "Mở trợ lý ảo"}
          className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-full shadow-lg ring-1 ring-black/5 transition hover:scale-105 active:scale-95 ${
            open ? "bg-[#007e42] text-white hover:bg-[#006838]" : "bg-[#007e42]"
          }`}
        >
          {open ? <IconClose /> : <BotAvatar className="h-full w-full" />}
        </button>
        {/* Chấm "đang hoạt động" — đặt ngoài button để không bị overflow-hidden cắt */}
        {!open && (
          <span className="pointer-events-none absolute right-0.5 top-0.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
          </span>
        )}
      </div>

      {/* ── Chat window ── */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[60] flex h-[680px] max-h-[calc(100vh-7rem)] w-[calc(100vw-2.5rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

          {/* Header */}
          <div className="flex items-center gap-3 bg-[#007e42] px-4 py-3 text-white">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white/40">
              <BotAvatar />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight">Trợ lý TP Agri</p>
              <p className="flex items-center gap-1.5 text-[11px] text-emerald-100/90">
                <span className="inline-block h-2 w-2 rounded-full bg-green-300" />
                Đang hoạt động
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15"
            >
              <IconClose />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-[#e5e7eb] px-4 py-4"
          >
            {messages.map((msg, idx) => {
              // Tin bot cuối của một cụm liên tiếp mới hiện avatar (tránh lặp)
              const isLastBotOfGroup =
                msg.role === "bot" && messages[idx + 1]?.role !== "bot";
              return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "bot" &&
                  (isLastBotOfGroup ? (
                    <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full ring-1 ring-[#007e42]/20">
                      <BotAvatar />
                    </div>
                  ) : (
                    /* Ô trống giữ thẳng hàng cho các tin bot phía trên */
                    <div className="h-7 w-7 shrink-0" />
                  ))}
                <div className={`flex flex-col ${msg.role === "user" ? "max-w-[75%] items-end" : "max-w-[85%] items-start"}`}>
                  {/* Bong bóng chữ */}
                  {msg.text && (
                    <div
                      className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "rounded-br-md bg-[#007e42] text-white"
                          : "rounded-bl-md bg-white text-gray-800"
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}

                  {/* Khối chẩn đoán bệnh */}
                  {msg.diagnosis && (
                    <div className="mt-1.5 w-full overflow-hidden rounded-xl border border-[#007e42]/20 bg-linear-to-br from-[#f0f8f3] to-[#e3f1e9] shadow-sm ring-1 ring-inset ring-white/60">
                      {/* Nhãn AI phía trên */}
                      <div className="flex items-center gap-1.5 border-b border-[#007e42]/10 px-3 py-1.5">
                        <span className="flex items-center gap-1 rounded-full bg-[#007e42] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                          Dự đoán
                        </span>
                      </div>

                      <div className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">🌾</span>
                          <p className="text-sm font-bold text-[#005f32]">{msg.diagnosis.disease}</p>
                        </div>
                        {/* Thanh độ tin cậy */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/70 ring-1 ring-inset ring-[#007e42]/10">
                            <div
                              className="h-full rounded-full bg-linear-to-r from-[#37b56e] to-[#007e42] transition-all"
                              style={{ width: `${msg.diagnosis.confidence}%` }}
                            />
                          </div>
                          <span className="shrink-0 text-xs font-bold text-[#007e42]">
                            {msg.diagnosis.confidence}%
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-gray-600">{msg.diagnosis.cause}</p>
                      </div>
                    </div>
                  )}

                  {/* Thẻ sản phẩm gợi ý */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-1.5 w-full space-y-2">
                      {msg.products.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white p-2 shadow-sm transition hover:border-[#007e42]/40 hover:shadow-md"
                        >
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f0f8f3]">
                            <Image src={p.image} alt={p.name} width={48} height={48} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-xs font-semibold leading-snug text-gray-800">{p.name}</p>
                            <div className="mt-0.5 flex items-baseline gap-1.5">
                              <span className="text-sm font-bold text-[#007e42]">{fmt(p.price)}</span>
                              {p.originalPrice && (
                                <span className="text-[10px] text-gray-400 line-through">{fmt(p.originalPrice)}</span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="shrink-0 rounded-full bg-[#007e42] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-[#006838]"
                          >
                            Xem
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="mt-1 px-1 text-[10px] text-gray-400">{msg.time}</span>
                </div>
              </div>
              );
            })}
          </div>

          {/* Quick replies */}
          <div className="flex flex-wrap gap-2 border-t border-gray-100 bg-white px-3 py-2">
            {quickReplies.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => handleSend(label)}
                className="rounded-full border border-[#007e42]/30 bg-[#007e42]/5 px-3 py-1 text-xs font-medium text-[#007e42] transition hover:bg-[#007e42]/10"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="h-10 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 outline-none transition focus:border-[#007e42] focus:ring-2 focus:ring-[#007e42]/20"
              aria-label="Nhập tin nhắn"
            />
            <button
              type="submit"
              aria-label="Gửi"
              disabled={!input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#007e42] text-white transition hover:bg-[#006838] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IconSend />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
