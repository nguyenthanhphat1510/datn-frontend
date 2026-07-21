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

/**
 * Trạng thái tầng phát hiện ảnh lạ (OOD) của ml-service. Khớp PredictStatus ở
 * backend disease-prediction.service.ts.
 *   KNOWN_DISEASE         - đủ tin cậy: hiện kết quả + thuốc gợi ý.
 *   NEED_MORE_INFORMATION - vùng xám: nêu bệnh nghi ngờ, KHÔNG gợi ý thuốc.
 *   UNKNOWN_DISEASE       - ảnh ngoài phân phối: không hiện bệnh nào.
 */
export type PredictStatus =
  | "KNOWN_DISEASE"
  | "NEED_MORE_INFORMATION"
  | "UNKNOWN_DISEASE";

/** Điểm chi tiết của tầng OOD — dùng để giải thích vì sao hệ thống từ chối. */
export interface OodInfo {
  energy_score: number;
  energy_threshold: number;
  energy_is_ood: boolean;
  feature_distance: number;
  distance_threshold: number;
  distance_is_ood: boolean;
  top_prob_calibrated: number;
  margin: number;
}

/** Kết quả trả về từ POST /diseases/predict. */
export interface PredictResult {
  status: PredictStatus;
  message: string; // câu trả lời sẵn từ ml-service
  predictions: DiseasePrediction[]; // top-k, sắp theo confidence giảm dần
  // null khi UNKNOWN_DISEASE — lúc đó dự đoán cao nhất không có ý nghĩa.
  top: DiseasePrediction | null;
  ood: OodInfo | null;
}
