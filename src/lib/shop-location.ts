/**
 * Vị trí cố định của shop/kho TP Agri — điểm xuất hàng.
 * Dùng để hiển thị cho người dùng (giao hàng đi từ đâu) và sau này
 * tính phí vận chuyển theo khoảng cách tới địa chỉ nhận (lat/lon từ resolve).
 *
 * Toạ độ lấy từ gogoduk /v1/place/resolve
 * (placeId ChIJ-28ACA-IoDERTq8PMxBVdJo).
 */
export const SHOP_LOCATION = {
  name: "Trường Đại học Kỹ thuật - Công nghệ Cần Thơ",
  address: "256 Đ. Nguyễn Văn Cừ, Cái Khế, Cần Thơ 900000, Việt Nam",
  district: "Phường Cái Khế",
  city: "Thành phố Cần Thơ",
  lat: 10.0467807,
  lon: 105.7680453,
} as const;
