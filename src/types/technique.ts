/** Tài liệu kỹ thuật (gom từ collection technique_chunks ở backend). */
export interface TechniqueDoc {
  docId: string;
  docTitle: string; // tên file gốc, vd "ky_thuat_lam_dat.txt"
  chunks: number;
  createdAt: string;
}

/** Nội dung đầy đủ của một tài liệu (đã ghép chunk) để hiển thị đọc. */
export interface TechniqueContent {
  docId: string;
  docTitle: string;
  content: string;
  chunks: number;
  createdAt: string | null;
}
