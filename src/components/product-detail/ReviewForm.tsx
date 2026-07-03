"use client";

import { useRef, useState } from "react";
import { createReview, uploadReviewImages } from "@/services/reviews";

/* Bộ chọn sao click được (1..5). */
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${n} sao`}
          className="transition"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill={n <= active ? "#f59e0b" : "none"}
            stroke={n <= active ? "#f59e0b" : "#d1d5db"}
            strokeWidth="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

/**
 * Form đánh giá 1 sản phẩm trong 1 đơn cụ thể (gắn orderId + productId).
 * Dùng trong modal ở trang đơn hàng. Đánh giá xong là khóa (không sửa được).
 */
export default function ReviewForm({
  orderId,
  productId,
  productName,
  onDone,
}: {
  orderId: string;
  productId: string;
  productName?: string;
  /** Gọi sau khi gửi đánh giá thành công. */
  onDone: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 5;

  // Thêm ảnh (gộp với ảnh đã chọn), giới hạn tối đa MAX_IMAGES.
  function addFiles(picked: FileList | null) {
    if (!picked) return;
    setFiles((prev) => [...prev, ...Array.from(picked)].slice(0, MAX_IMAGES));
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const saved = await createReview(orderId, productId, { rating, comment });
      if (files.length > 0) {
        await uploadReviewImages(saved._id, files);
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {productName && (
        <p className="mb-3 text-sm font-semibold text-gray-700">
          {productName}
        </p>
      )}

      <StarPicker value={rating} onChange={setRating} />

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
        className="mt-3 w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#007e42]"
      />

      {/* Upload ảnh: nút thêm dạng ô nét đứt + preview thumbnail có nút xóa */}
      <div className="mt-3">
        <p className="mb-1.5 text-xs font-medium text-gray-500">
          Thêm ảnh ({files.length}/{MAX_IMAGES})
        </p>
        {/* Input file thật — ẩn đi, mở qua nút */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = ""; // reset để chọn lại cùng ảnh được
          }}
        />
        <div className="flex flex-wrap gap-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="group relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={`Ảnh ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(idx)}
                aria-label="Xóa ảnh"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}

          {files.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-[#007e42] hover:text-[#007e42]"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="text-[10px] font-medium">Thêm ảnh</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm font-medium text-red-500">{error}</p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[#007e42] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#005f32] disabled:opacity-60"
        >
          {submitting ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </div>
    </form>
  );
}
