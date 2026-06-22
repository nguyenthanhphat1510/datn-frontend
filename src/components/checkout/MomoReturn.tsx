"use client";

import PaymentReturn from "./PaymentReturn";
import { verifyMomoReturn } from "@/services/orders";

/** Trang xác nhận thanh toán MoMo — dùng component chung PaymentReturn. */
export default function MomoReturn() {
  return <PaymentReturn verify={verifyMomoReturn} />;
}
