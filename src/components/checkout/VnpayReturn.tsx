"use client";

import PaymentReturn from "./PaymentReturn";
import { verifyVnpayReturn } from "@/services/orders";

/** Trang xác nhận thanh toán VNPay — dùng component chung PaymentReturn. */
export default function VnpayReturn() {
  return <PaymentReturn verify={verifyVnpayReturn} />;
}
