import { apiGet, apiPost, apiUpload } from "@/lib/api";
import type { Paginated, Review } from "@/types/product";

/** Danh sách đánh giá của 1 sản phẩm (gom từ mọi đơn). Phân trang, lọc theo sao tùy chọn. */
export function getProductReviews(
  productId: string,
  params: { page?: number; limit?: number; rating?: number } = {},
): Promise<Paginated<Review>> {
  return apiGet<Paginated<Review>>(`/reviews/product/${productId}`, {
    page: params.page,
    limit: params.limit,
    rating: params.rating,
  });
}

/** Danh sách productId user đã đánh giá trong 1 đơn (để ẩn nút). Cần đăng nhập. */
export function getReviewedProductIds(orderId: string): Promise<string[]> {
  return apiGet<string[]>(
    `/reviews/order/${orderId}/reviewed`,
    undefined,
    { auth: true },
  );
}

export interface ReviewPayload {
  rating: number;
  comment?: string;
}

/** Tạo đánh giá cho 1 sản phẩm trong 1 đơn đã giao. */
export function createReview(
  orderId: string,
  productId: string,
  payload: ReviewPayload,
): Promise<Review> {
  return apiPost<Review>(
    "/reviews",
    { orderId, productId, ...payload },
    { auth: true },
  );
}

/** Upload ảnh cho đánh giá vừa tạo (field `files`, tối đa 5 ảnh). */
export function uploadReviewImages(
  id: string,
  files: File[],
): Promise<Review> {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  return apiUpload<Review>(`/reviews/${id}/images`, fd, { auth: true });
}
