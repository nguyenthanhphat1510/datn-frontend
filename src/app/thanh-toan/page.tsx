import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutPage from "@/components/checkout/CheckoutPage";

export const metadata: Metadata = {
  title: "Thanh toán | TP Agri",
  description: "Chọn địa chỉ giao hàng và hoàn tất đặt hàng tại TP Agri",
};

export default function ThanhToanPage() {
  // Suspense: CheckoutPage dùng useSearchParams (đọc ?items=) — App Router yêu cầu.
  return (
    <Suspense>
      <CheckoutPage />
    </Suspense>
  );
}
