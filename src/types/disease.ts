import type { ProductImage } from "./product";

/**
 * Shape khớp với Disease entity của backend (đã strip embedding ở API công khai).
 * Xem backend/src/diseases/entities/disease.entity.ts
 */
export interface Disease {
  _id: string;
  name: string; // VD "Đạo ôn lá"
  slug: string;
  symptoms: string[]; // danh sách triệu chứng
  description?: string; // mô tả / nguyên nhân
  recommendedProductIds: string[]; // ref tới Product._id (thuốc gợi ý)
  images: ProductImage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
