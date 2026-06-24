import { apiGet } from "@/lib/api";
import type { Disease } from "@/types/disease";

/** Lấy danh sách bệnh lúa đang hiển thị (isActive) — Public */
export function fetchDiseases(): Promise<Disease[]> {
  return apiGet<Disease[]>("/diseases");
}

/** Lấy chi tiết 1 bệnh theo ID — Public */
export function getDisease(id: string): Promise<Disease> {
  return apiGet<Disease>(`/diseases/${id}`);
}
