import type { Metadata } from "next";
import MomoReturn from "@/components/checkout/MomoReturn";

export const metadata: Metadata = {
  title: "Xác nhận thanh toán | TP Agri",
  description: "Đang xác nhận kết quả thanh toán MoMo",
};

export default function MomoReturnPage() {
  return <MomoReturn />;
}
