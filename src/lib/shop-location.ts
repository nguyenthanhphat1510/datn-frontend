/**
 * Vị trí cố định của shop/kho TP Agri — điểm xuất hàng.
 *
 * Ở FRONTEND chỉ dùng để HIỂN THỊ (tên + địa chỉ: "giao hàng đi từ đâu").
 * Việc tính phí ship đã chuyển hẳn về backend — nó gọi gogoduk /v1/directions
 * đo quãng đường thật rồi trả phí qua GET /orders/shipping-fee. Toạ độ dùng cho
 * phép đo đó nằm ở backend/src/common/shipping.ts (SHOP_LOCATION), sửa vị trí
 * kho thì nhớ sửa CẢ HAI nơi.
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
