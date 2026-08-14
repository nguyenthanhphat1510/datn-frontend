import { apiGet, apiPost } from "@/lib/api";

/* ─── Shape khớp với backend Order (orders entity/dto) ─── */
export interface ShippingAddressInput {
  fullName: string;
  phone: string;
  address: string; // địa chỉ đầy đủ (1 chuỗi gộp)
  lat?: number; // toạ độ resolve từ gogoduk — để backend tính phí ship
  lon?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: number; // giá tại thời điểm mua (snapshot)
  quantity: number;
  subtotal: number;
}

export type PaymentMethod = "cod" | "vnpay";
export type PaymentStatus = "unpaid" | "paid" | "failed";

export interface Order {
  _id: string;
  items: OrderItem[];
  shippingFee: number; // phí ship đã chốt server-side
  total: number; // hàng + ship
  status: string; // pending | confirmed | shipping | delivered | cancelled
  shippingAddress: ShippingAddressInput;
  note?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  createdAt: string;
}

/**
 * Body khớp CreateOrderDto — cung cấp MỘT trong hai:
 *  - addressId: chọn từ sổ địa chỉ đã lưu (ưu tiên)
 *  - shippingAddress: nhập tay tại trang checkout
 */
export interface CreateOrderInput {
  addressId?: string;
  shippingAddress?: ShippingAddressInput;
  /** Chỉ đặt các sản phẩm này trong giỏ (theo productId). Bỏ trống = cả giỏ. */
  productIds?: string[];
  note?: string;
  paymentMethod?: PaymentMethod;
}

/** POST /orders — checkout: tạo đơn từ giỏ hàng hiện tại, backend tự clear giỏ. */
export function createOrder(dto: CreateOrderInput): Promise<Order> {
  return apiPost<Order>("/orders", dto, { auth: true });
}

/** GET /orders — danh sách đơn của user (mới nhất lên đầu). */
export function getOrders(): Promise<Order[]> {
  return apiGet<Order[]>("/orders", undefined, { auth: true });
}

export interface ShippingFeeResult {
  fee: number;
  /** Quãng đường km; null khi địa chỉ chưa có toạ độ. */
  distanceKm: number | null;
  /** 'route' = đường đi thật từ gogoduk; 'haversine' = dự phòng đường chim bay. */
  source: "route" | "haversine";
  /** Đơn ở xa (>50km) → hiện cảnh báo phí ship cao hơn bình thường. */
  isFar: boolean;
}

/**
 * GET /orders/shipping-fee — hỏi backend phí ship cho 1 toạ độ.
 *
 * Frontend KHÔNG tự tính nữa: khoảng cách lấy từ gogoduk mà API key nằm ở
 * server. Hỏi backend cũng đảm bảo số hiện trên màn hình đúng bằng số backend
 * chốt lúc tạo đơn — trước đây hai bên tự tính riêng nên phải giữ đồng bộ tay.
 */
export function getShippingFee(
  lat?: number,
  lon?: number,
): Promise<ShippingFeeResult> {
  const params =
    lat != null && lon != null
      ? { lat: String(lat), lon: String(lon) }
      : undefined;
  return apiGet<ShippingFeeResult>("/orders/shipping-fee", params, {
    auth: true,
  });
}

/**
 * POST /orders/:id/vnpay-url — lấy URL cổng thanh toán VNPay cho đơn hàng.
 * Frontend redirect khách sang URL này.
 */
export function getVnpayUrl(orderId: string): Promise<{ paymentUrl: string }> {
  return apiPost<{ paymentUrl: string }>(
    `/orders/${orderId}/vnpay-url`,
    {},
    { auth: true },
  );
}

export interface PaymentReturnResult {
  success: boolean;
  orderId: string | null;
  message: string;
}
/** @deprecated dùng PaymentReturnResult — giữ alias cho code cũ. */
export type VnpayReturnResult = PaymentReturnResult;

/**
 * GET /orders/vnpay-return — gửi nguyên query params VNPay trả về để backend
 * verify chữ ký và cập nhật trạng thái thanh toán. `search` là chuỗi bắt đầu
 * bằng '?' lấy từ window.location.search.
 */
export function verifyVnpayReturn(
  search: string,
): Promise<PaymentReturnResult> {
  const qs = search.startsWith("?") ? search.slice(1) : search;
  return apiGet<PaymentReturnResult>(`/orders/vnpay-return?${qs}`);
}
