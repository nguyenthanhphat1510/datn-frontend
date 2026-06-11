import type { Metadata } from "next";
import OrderSuccess from "@/components/checkout/OrderSuccess";

export const metadata: Metadata = {
  title: "Đặt hàng thành công | TP Agri",
  description: "Đơn hàng của bạn đã được ghi nhận tại TP Agri",
};

export default function DatHangThanhCongPage() {
  return <OrderSuccess />;
}
