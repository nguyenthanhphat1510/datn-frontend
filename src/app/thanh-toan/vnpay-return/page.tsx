import type { Metadata } from "next";
import VnpayReturn from "@/components/checkout/VnpayReturn";

export const metadata: Metadata = {
  title: "Xác nhận thanh toán | TP Agri",
  description: "Đang xác nhận kết quả thanh toán VNPay",
};

export default function VnpayReturnPage() {
  return <VnpayReturn />;
}
