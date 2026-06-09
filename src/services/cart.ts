import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

/* ─── Shape khớp với backend CartResponse (cart.service.ts) ─── */
export interface CartItemResponse {
  productId: string;
  name: string;
  imageUrl: string;
  price: number; // giá real-time từ Product
  quantity: number;
  subtotal: number; // price * quantity
}

export interface CartResponse {
  items: CartItemResponse[];
  total: number; // tổng tiền toàn giỏ
  itemCount: number; // số loại sản phẩm
}

/** GET /cart — lấy giỏ hàng hiện tại của user. */
export function getCart(): Promise<CartResponse> {
  return apiGet<CartResponse>("/cart", undefined, { auth: true });
}

/** POST /cart/items — thêm sản phẩm vào giỏ (cộng dồn nếu đã có). */
export function addCartItem(
  productId: string,
  quantity: number,
): Promise<CartResponse> {
  return apiPost<CartResponse>(
    "/cart/items",
    { productId, quantity },
    { auth: true },
  );
}

/** PATCH /cart/items/:productId — cập nhật số lượng (0 = xóa item). */
export function updateCartItem(
  productId: string,
  quantity: number,
): Promise<CartResponse> {
  return apiPatch<CartResponse>(
    `/cart/items/${productId}`,
    { quantity },
    { auth: true },
  );
}

/** DELETE /cart/items/:productId — xóa hẳn 1 sản phẩm khỏi giỏ. */
export function removeCartItem(productId: string): Promise<CartResponse> {
  return apiDelete<CartResponse>(`/cart/items/${productId}`, { auth: true });
}

/** DELETE /cart — xóa toàn bộ giỏ hàng. */
export function clearCart(): Promise<{ message: string }> {
  return apiDelete<{ message: string }>("/cart", { auth: true });
}
