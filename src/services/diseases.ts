import { apiGet, apiUpload } from "@/lib/api";
import type { Disease, PredictResult } from "@/types/disease";

/** Lấy danh sách bệnh lúa đang hiển thị (isActive) — Public */
export function fetchDiseases(): Promise<Disease[]> {
  return apiGet<Disease[]>("/diseases");
}

/** Lấy chi tiết 1 bệnh theo ID — Public */
export function getDisease(id: string): Promise<Disease> {
  return apiGet<Disease>(`/diseases/${id}`);
}

/**
 * Gửi ảnh lá lúa lên backend để model (ml-service) dự đoán bệnh.
 * Trả về top-k bệnh kèm thông tin chi tiết + thuốc gợi ý (nếu có trong DB).
 */
export function predictDisease(file: File): Promise<PredictResult> {
  const form = new FormData();
  form.append("file", file);
  return apiUpload<PredictResult>("/diseases/predict", form);
}
