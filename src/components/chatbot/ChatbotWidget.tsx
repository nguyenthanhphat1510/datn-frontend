"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { apiPost, apiUpload } from "@/lib/api";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type ChatProduct = {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  rating: number;
  reviewCount: number;
};

type DiagnosisLevel = "cao" | "trung_binh" | "thap";

type Diagnosis = {
  disease: string;
  confidence: number; // 0..100
  level: DiagnosisLevel;
};

type Message = {
  id: number;
  role: "bot" | "user";
  text?: string;
  time: string;
  image?: string; // object URL ảnh người dùng vừa gửi (nhánh chẩn đoán qua ảnh)
  products?: ChatProduct[];
  diagnosis?: Diagnosis;
  sources?: string[]; // tên tài liệu kỹ thuật nguồn (nhánh ky_thuat)
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

/** Ghim kẹp — nút đính ảnh lá lúa để chẩn đoán */
function IconPaperclip() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
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

/** Tài liệu — nhãn nguồn cho câu trả lời kỹ thuật (lấy từ tài liệu đã upload) */
function IconDoc() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
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
   Render text bot: hỗ trợ **in đậm** và xuống dòng.
   Bot chỉ dùng 2 cú pháp này nên xử lý thủ công, khỏi thêm thư viện markdown.
───────────────────────────────────────── */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, li) => (
        <span key={li} className="block">
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, pi) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={pi} className="font-semibold">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <span key={pi}>{part}</span>
            ),
          )}
        </span>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────
   Thẻ chẩn đoán — hiện tên bệnh dự đoán + độ tin cậy (% + nhãn + thanh bar).
───────────────────────────────────────── */
const DIAGNOSIS_STYLE: Record<
  DiagnosisLevel,
  { label: string; text: string; bar: string; bg: string; ring: string }
> = {
  cao: {
    label: "Khả năng cao",
    text: "text-[#007e42]",
    bar: "bg-[#007e42]",
    bg: "bg-emerald-100/60",
    ring: "ring-[#007e42]/25",
  },
  trung_binh: {
    label: "Khả năng trung bình",
    text: "text-amber-600",
    bar: "bg-amber-500",
    bg: "bg-amber-100/60",
    ring: "ring-amber-500/25",
  },
  thap: {
    label: "Khả năng thấp",
    text: "text-gray-500",
    bar: "bg-gray-400",
    bg: "bg-gray-100/70",
    ring: "ring-gray-300",
  },
};

/* TEST UI: map tên bệnh → ảnh minh họa trong /public.
   Tạm dùng chung 1 ảnh để xem bố cục; sau này thay ảnh riêng từng bệnh. */
function diseaseImage(_name: string): string {
  return "/dao-on-lua.png";
}

/* Mock tên tiếng Anh + tác nhân theo TÊN BỆNH (tiếng Việt) — giống trang chẩn
   đoán (/chan-doan), key theo tên vì thẻ chatbot không có slug. */
const DISEASE_ENGLISH_NAME: Record<string, string> = {
  "Đạo ôn lá": "Rice Blast",
  "Đạo ôn cổ bông": "Neck Blast",
  "Bạc lá (cháy bìa lá)": "Bacterial Leaf Blight",
  "Lem lép hạt": "Dirty Panicle / Grain Discoloration",
  "Vàng lùn - lùn xoắn lá": "Rice Grassy Stunt / Ragged Stunt",
  "Đốm nâu": "Brown Spot",
};

const DISEASE_CAUSE: Record<string, string> = {
  "Đạo ôn lá": "Nấm Pyricularia oryzae",
  "Đạo ôn cổ bông": "Nấm Pyricularia oryzae",
  "Bạc lá (cháy bìa lá)": "Vi khuẩn Xanthomonas oryzae",
  "Lem lép hạt": "Nấm và vi khuẩn (Bipolaris, Curvularia...)",
  "Vàng lùn - lùn xoắn lá": "Virus (rầy nâu truyền bệnh)",
  "Đốm nâu": "Nấm Bipolaris oryzae",
};

function DiagnosisCard({ diagnosis }: { diagnosis: Diagnosis }) {
  const s = DIAGNOSIS_STYLE[diagnosis.level];
  const img = diseaseImage(diagnosis.disease);
  const englishName = DISEASE_ENGLISH_NAME[diagnosis.disease];
  const cause = DISEASE_CAUSE[diagnosis.disease];
  return (
    <div className="flex w-full gap-3 overflow-hidden rounded-xl border-2 border-amber-400 bg-white p-3 shadow-sm">
      {/* Ảnh minh họa bệnh */}
      <div className="h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={diagnosis.disease} className="h-full w-full object-cover" />
      </div>

      {/* Nội dung */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="mb-1 inline-block rounded-full bg-[#007e42] px-2 py-0.5 text-[9px] font-bold uppercase text-white">
              Khả năng cao nhất
            </span>
            <h3 className="text-sm font-extrabold text-gray-900">{diagnosis.disease}</h3>
            {englishName && (
              <p className="mt-0.5 text-[11px] text-gray-600">
                <span className="font-semibold text-gray-500">Tên tiếng Anh: </span>
                {englishName}
              </p>
            )}
            {cause && (
              <p className="mt-0.5 text-[11px] text-gray-600">
                <span className="font-semibold text-gray-500">Tác nhân: </span>
                {cause}
              </p>
            )}
            <p className={`mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold ${s.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${s.bar}`} />
              {s.label}
            </p>
          </div>
          <span className={`shrink-0 text-base font-black ${s.text}`}>
            {diagnosis.confidence}%
          </span>
        </div>

        {/* Thanh độ tin cậy */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all ${s.bar}`}
            style={{ width: `${diagnosis.confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* Số sao đánh giá — 5 sao, tô vàng theo rating (làm tròn 0.5). */
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = rating >= i - 0.25; // sao đầy
        const half = !filled && rating >= i - 0.75; // nửa sao
        return (
          <svg key={i} width="13" height="13" viewBox="0 0 24 24"
            className={filled || half ? "text-amber-400" : "text-gray-300"} aria-hidden="true">
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              fill={half ? `url(#half-${i})` : "currentColor"}
              stroke="currentColor"
              strokeWidth="1"
              d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 9.5l6.9-.6z"
            />
          </svg>
        );
      })}
    </span>
  );
}

/* ─────────────────────────────────────────
   Thẻ sản phẩm thuốc gợi ý — bấm sang trang chi tiết sản phẩm.
───────────────────────────────────────── */
function ProductCard({ product }: { product: ChatProduct }) {
  return (
    <a
      href={`/san-pham/${product.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-[calc(50%-0.375rem)] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-gray-200 bg-white"
    >
      <div className="flex h-44 w-full items-center justify-center overflow-hidden bg-gray-50 p-3">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:-translate-y-2"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#007e42]">
            <IconLeaf />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="line-clamp-2 min-h-[2.5rem] text-sm font-bold uppercase leading-snug text-gray-800 transition group-hover:text-[#007e42]">
          {product.name}
        </span>
        {product.reviewCount > 0 ? (
          <div className="flex items-center gap-1.5">
            <Stars rating={product.rating} />
            <span className="text-xs text-gray-400">({product.reviewCount} đánh giá)</span>
          </div>
        ) : (
          <span className="text-[11px] text-gray-400">Chưa có đánh giá</span>
        )}
        <div className="mt-auto flex flex-wrap items-baseline gap-1.5 pt-1">
          <span className="text-base font-bold text-[#007e42]">
            {product.price.toLocaleString("vi-VN")}đ
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {product.originalPrice.toLocaleString("vi-VN")}đ
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

/* ─────────────────────────────────────────
   Tin nhắn chào ban đầu
───────────────────────────────────────── */
const welcomeMessage: Message = {
  id: 1,
  role: "bot",
  text: "Xin chào! Mình là trợ lý ảo của TP Agri 🌾. Bạn cứ mô tả tình trạng cây lúa hoặc bấm một gợi ý bên dưới, mình hỗ trợ ngay nhé!",
  time: "",
};

/* Nút gợi ý nhanh — câu chữ khớp với luật phân loại intent ở backend.
   Hiện dưới tin chào đầu, ẩn đi sau khi người dùng bắt đầu chat. */
const quickReplies = [
  "Tư vấn phân bón",
  "Thuốc trị sâu bệnh",
  "Chẩn đoán bệnh lúa",
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
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tự cuộn xuống cuối khi có tin nhắn mới, khi mở, hoặc khi bot đang gõ
  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, open, loading]);

  function nowTime() {
    return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }

  async function handleSend(text: string) {
    const value = text.trim();
    if (!value || loading) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: value,
      time: nowTime(),
    };

    // Lịch sử gửi lên API = các tin có text (bỏ field UI), map role bot→assistant.
    const history = [...messages, userMsg]
      .filter((m) => m.text)
      .map((m) => ({
        role: m.role === "bot" ? ("assistant" as const) : ("user" as const),
        content: m.text as string,
      }));

    // SP đang hiển thị = thẻ SP của tin bot gần nhất có products. Gửi kèm để bot
    // so sánh ĐÚNG các SP người dùng đang nhìn (nhánh so_sanh ở backend).
    const lastProducts = [...messages]
      .reverse()
      .find((m) => m.role === "bot" && m.products && m.products.length > 0)?.products;
    const comparedProductIds = lastProducts?.map((p) => p.id);

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { reply, products, diagnosis, sources } = await apiPost<{
        reply: string;
        products?: ChatProduct[];
        diagnosis?: Diagnosis;
        sources?: string[];
      }>("/chatbot/message", {
        messages: history,
        ...(comparedProductIds?.length ? { comparedProductIds } : {}),
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          text: reply,
          time: nowTime(),
          products,
          diagnosis,
          sources,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          text:
            err instanceof Error
              ? err.message
              : "Xin lỗi, mình đang gặp sự cố. Bạn thử lại sau nhé.",
          time: nowTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Gửi ẢNH lá lúa → gọi /chatbot/predict-image (model AI dự đoán bệnh), hiển thị
  // thẻ chẩn đoán + thuốc gợi ý giống nhánh mô tả bằng chữ.
  async function handleSendImage(file: File) {
    if (loading) return;

    // Validate khớp giới hạn ml-service (JPG/PNG/WEBP, ≤5MB) để báo lỗi sớm.
    const okType = ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
      file.type,
    );
    if (!okType) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "bot",
          text: "Ảnh phải là JPG, PNG hoặc WEBP bạn nhé.",
          time: nowTime(),
        },
      ]);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "bot",
          text: "Ảnh vượt quá 5MB, bạn chọn ảnh nhẹ hơn nhé.",
          time: nowTime(),
        },
      ]);
      return;
    }

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: "Đã gửi 1 ảnh lá lúa",
      image: URL.createObjectURL(file),
      time: nowTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const { reply, products, diagnosis } = await apiUpload<{
        reply: string;
        products?: ChatProduct[];
        diagnosis?: Diagnosis;
      }>("/chatbot/predict-image", form);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          text: reply,
          time: nowTime(),
          products,
          diagnosis,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          text:
            err instanceof Error
              ? err.message
              : "Xin lỗi, mình chưa chẩn đoán được ảnh này. Bạn thử lại sau nhé.",
          time: nowTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
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
        <div className="fixed bottom-24 right-5 z-[60] flex h-[760px] max-h-[calc(100vh-7rem)] w-[calc(100vw-2.5rem)] max-w-xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

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
                <div className={`flex flex-col ${msg.role === "user" ? "max-w-[75%] items-end" : "w-full max-w-[92%] items-start"}`}>
                  {/* Thẻ chẩn đoán — hiện trên cùng cho dễ thấy & tin cậy */}
                  {msg.diagnosis && (
                    <div className="mb-2 w-full">
                      <DiagnosisCard diagnosis={msg.diagnosis} />
                    </div>
                  )}

                  {/* Ảnh người dùng gửi (nhánh chẩn đoán qua ảnh) */}
                  {msg.image && (
                    <div className="mb-1 overflow-hidden rounded-2xl rounded-br-md border border-[#007e42]/20 bg-white shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.image}
                        alt="Ảnh lá lúa đã gửi"
                        className="max-h-48 w-auto max-w-[220px] object-cover"
                      />
                    </div>
                  )}

                  {/* Bong bóng chữ */}
                  {msg.text && (
                    <div
                      className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "rounded-br-md bg-[#007e42] text-white"
                          : "rounded-bl-md bg-white text-gray-800"
                      }`}
                    >
                      {msg.role === "bot" ? <RichText text={msg.text} /> : msg.text}
                    </div>
                  )}

                  {/* Nhãn nguồn tài liệu (nhánh kỹ thuật) — cho người dùng biết câu
                      trả lời lấy từ tài liệu thật đã upload, không phải AI bịa ra. */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#007e42]">
                        <IconDoc />
                        Nguồn từ tài liệu kỹ thuật:
                      </span>
                      {msg.sources.map((src) => (
                        <span
                          key={src}
                          className="inline-flex max-w-[180px] items-center truncate rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-[#007e42] ring-1 ring-[#007e42]/20"
                          title={src}
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Thẻ thuốc gợi ý (nhánh chẩn đoán bệnh) — card viền bao trọn */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                      <p className="bg-[#007e42] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white">
                        Sản phẩm gợi ý
                      </p>
                      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto bg-gray-200 p-3 [scrollbar-width:thin]">
                        {msg.products.map((p) => (
                          <ProductCard key={p.id} product={p} />
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.time && (
                    <span className="mt-1 px-1 text-[10px] text-gray-400">{msg.time}</span>
                  )}
                </div>
              </div>
              );
            })}

            {/* Nút gợi ý dưới tin chào — chỉ hiện khi chưa bắt đầu chat */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pl-9">
                {quickReplies.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleSend(label)}
                    className="rounded-full border border-[#007e42] bg-white px-4 py-2 text-sm font-medium text-[#007e42] shadow-sm transition hover:bg-[#007e42]! hover:text-white!"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Bong bóng "đang gõ" khi chờ bot trả lời */}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full ring-1 ring-[#007e42]/20">
                  <BotAvatar />
                </div>
                <div className="rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-sm">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#007e42]/40 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#007e42]/40 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#007e42]/40" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-3"
          >
            {/* Input file ẩn — mở khi bấm nút ghim */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleSendImage(file);
                e.target.value = ""; // reset để chọn lại cùng ảnh được
              }}
            />
            {/* Nút đính ảnh lá lúa để chẩn đoán */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              aria-label="Gửi ảnh lá lúa"
              title="Gửi ảnh lá lúa để chẩn đoán bệnh"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#007e42] transition hover:bg-[#007e42]/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IconPaperclip />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder={loading ? "Trợ lý đang trả lời..." : "Nhập tin nhắn..."}
              className="h-10 flex-1 rounded-full border-2 border-gray-300 bg-gray-50 px-4 text-sm text-gray-800 outline-none transition focus:border-[#007e42] focus:ring-2 focus:ring-[#007e42]/20 disabled:opacity-60"
              aria-label="Nhập tin nhắn"
            />
            <button
              type="submit"
              aria-label="Gửi"
              disabled={!input.trim() || loading}
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
