import type { Metadata } from "next";
import CheckoutPage from "@/components/checkout/CheckoutPage";

export const metadata: Metadata = {
  title: "Thanh toán | TP Agri",
  description: "Chọn địa chỉ giao hàng và hoàn tất đặt hàng tại TP Agri",
};

export default function ThanhToanPage() {
  return <CheckoutPage />;
}
