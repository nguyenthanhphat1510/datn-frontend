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

export interface Order {
  _id: string;
  items: OrderItem[];
  shippingFee: number; // phí ship đã chốt server-side
  total: number; // hàng + ship
  status: string; // pending | confirmed | shipping | delivered | cancelled
  shippingAddress: ShippingAddressInput;
  note?: string;
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
  note?: string;
}

/** POST /orders — checkout: tạo đơn từ giỏ hàng hiện tại, backend tự clear giỏ. */
export function createOrder(dto: CreateOrderInput): Promise<Order> {
  return apiPost<Order>("/orders", dto, { auth: true });
}

/** GET /orders — danh sách đơn của user (mới nhất lên đầu). */
export function getOrders(): Promise<Order[]> {
  return apiGet<Order[]>("/orders", undefined, { auth: true });
}
