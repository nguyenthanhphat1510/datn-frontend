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

/**
 * Một dự đoán bệnh từ model (ml-service) đã được backend "làm giàu" với thông tin
 * Disease trong DB. Khớp EnrichedPrediction ở backend disease-prediction.service.ts.
 */
export interface DiseasePrediction {
  class: string; // slug bệnh model trả về
  label: string; // tên hiển thị (tiếng Việt)
  confidence: number; // độ tin cậy 0..1
  // Thông tin bệnh trong DB nếu khớp slug; null nếu DB chưa có (vd lá khỏe).
  disease: Disease | null;
}

/** Kết quả trả về từ POST /diseases/predict. */
export interface PredictResult {
  predictions: DiseasePrediction[]; // top-k, sắp theo confidence giảm dần
  top: DiseasePrediction; // dự đoán cao nhất
}
