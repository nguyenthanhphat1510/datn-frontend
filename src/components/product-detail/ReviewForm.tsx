"use client";

import { useState } from "react";
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

      <label className="mt-3 block text-xs font-medium text-gray-500">
        Thêm ảnh (tối đa 5):
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) =>
            setFiles(Array.from(e.target.files ?? []).slice(0, 5))
          }
          className="mt-1 block w-full text-sm text-gray-600"
        />
      </label>
      {files.length > 0 && (
        <p className="mt-1 text-xs text-gray-400">Đã chọn {files.length} ảnh</p>
      )}

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
