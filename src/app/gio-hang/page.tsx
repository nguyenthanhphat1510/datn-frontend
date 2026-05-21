import type { Metadata } from "next";
import CartPage from "@/components/cart/CartPage";

export const metadata: Metadata = {
  title: "Giỏ hàng | TP Agri",
  description: "Xem và quản lý các sản phẩm trong giỏ hàng của bạn tại TP Agri",
};

export default function GioHangPage() {
  return <CartPage />;
}
