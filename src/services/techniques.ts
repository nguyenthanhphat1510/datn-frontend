import { apiGet } from "@/lib/api";
import type { TechniqueDoc, TechniqueContent } from "@/types/technique";

/** Danh sách tài liệu kỹ thuật đã nạp — Public */
export function fetchTechniqueDocs(): Promise<TechniqueDoc[]> {
  return apiGet<TechniqueDoc[]>("/techniques");
}

/** Toàn bộ nội dung một tài liệu (đã ghép chunk) để đọc — Public */
export function getTechniqueContent(docId: string): Promise<TechniqueContent> {
  return apiGet<TechniqueContent>(`/techniques/${encodeURIComponent(docId)}`);
}

/**
 * Tiêu đề tiếng Việt CÓ DẤU cho từng tài liệu, khớp theo tên file (đã bỏ đuôi).
 * Tên file lưu không dấu (ky_thuat_lam_dat.txt) nên cần map để hiển thị đúng.
 */
const TITLE_BY_SLUG: Record<string, string> = {
  ky_thuat_lam_dat: "Kỹ thuật làm đất",
  ky_thuat_chon_giong_va_ngam_u_giong: "Kỹ thuật chọn giống và ngâm ủ giống",
  ky_thuat_gieo_sa: "Kỹ thuật gieo sạ",
  ky_thuat_bon_phan: "Kỹ thuật bón phân",
  ky_thuat_quan_ly_nuoc: "Kỹ thuật quản lý nước",
  ky_thuat_quan_ly_co_dai: "Kỹ thuật quản lý cỏ dại",
  ky_thuat_phong_tru_sau_benh_va_thuoc_bvtv:
    "Kỹ thuật phòng trừ sâu bệnh và thuốc BVTV",
  ky_thuat_thu_hoach_va_bao_quan: "Kỹ thuật thu hoạch và bảo quản",
};

/**
 * Chuyển tên file thành tiêu đề đẹp. Ưu tiên map tiếng Việt có dấu; nếu không có
 * trong map thì bỏ đuôi file, thay _ bằng space và viết hoa đầu câu.
 */
export function prettyDocTitle(docTitle: string): string {
  const slug = docTitle.replace(/\.[^.]+$/, "").trim();
  if (TITLE_BY_SLUG[slug]) return TITLE_BY_SLUG[slug];

  const base = slug.replace(/[_-]+/g, " ").trim();
  if (!base) return docTitle;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/**
 * Thứ tự hiển thị theo trình tự canh tác lúa (làm đất → ... → thu hoạch).
 * Tài liệu không có trong danh sách này sẽ xếp xuống cuối.
 */
const DISPLAY_ORDER = [
  "ky_thuat_lam_dat",
  "ky_thuat_chon_giong_va_ngam_u_giong",
  "ky_thuat_gieo_sa",
  "ky_thuat_bon_phan",
  "ky_thuat_quan_ly_nuoc",
  "ky_thuat_quan_ly_co_dai",
  "ky_thuat_phong_tru_sau_benh_va_thuoc_bvtv",
  "ky_thuat_thu_hoach_va_bao_quan",
];

/** Sắp xếp danh sách tài liệu theo trình tự canh tác. */
export function sortByCanhTac<T extends { docTitle: string }>(docs: T[]): T[] {
  const rank = (docTitle: string) => {
    const slug = docTitle.replace(/\.[^.]+$/, "").trim();
    const i = DISPLAY_ORDER.indexOf(slug);
    return i === -1 ? DISPLAY_ORDER.length : i;
  };
  return [...docs].sort((a, b) => rank(a.docTitle) - rank(b.docTitle));
}
