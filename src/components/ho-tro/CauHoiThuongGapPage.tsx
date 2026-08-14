"use client";

import { useState } from "react";
import Link from "next/link";
import SupportHero from "./SupportHero";

const faqs = [
  {
    q: "Làm sao để đặt hàng tại TP Agri?",
    a: "Bạn chọn sản phẩm, thêm vào giỏ hàng, rồi bấm Thanh toán và điền thông tin nhận hàng. Xem chi tiết tại trang Hướng dẫn mua hàng.",
  },
  {
    q: "TP Agri có những phương thức thanh toán nào?",
    a: "Chúng tôi hỗ trợ thanh toán khi nhận hàng (COD) và VNPay. Với VNPay bạn sẽ được chuyển sang cổng thanh toán để hoàn tất.",
  },
  {
    q: "Phí vận chuyển được tính như thế nào?",
    a: "Phí vận chuyển được tính theo khoảng cách từ kho TP Agri đến địa chỉ nhận hàng của bạn. Phí cụ thể sẽ hiển thị ở bước điền thông tin giao hàng trước khi bạn xác nhận đặt hàng.",
  },
  {
    q: "Sản phẩm có phải hàng chính hãng không?",
    a: "Có. TP Agri cam kết 100% phân bón và thuốc bảo vệ thực vật là hàng chính hãng, có nguồn gốc rõ ràng từ các thương hiệu uy tín.",
  },
  {
    q: "Tôi có thể đổi hoặc trả hàng không?",
    a: "Được, nếu sản phẩm còn nguyên vẹn chưa sử dụng hoặc bị lỗi từ nhà sản xuất. Vui lòng xem chi tiết tại trang Chính sách đổi trả.",
  },
  {
    q: "Làm sao theo dõi đơn hàng của tôi?",
    a: "Sau khi đặt hàng thành công, bạn vào mục “Đơn hàng của tôi” để xem trạng thái xử lý và giao hàng của từng đơn.",
  },
  {
    q: "Chức năng chẩn đoán bệnh lúa hoạt động thế nào?",
    a: "Bạn tải ảnh lá lúa lên trang Chẩn đoán, hệ thống AI sẽ phân tích và gợi ý loại bệnh cùng thuốc phù hợp để phòng trị.",
  },
  {
    q: "Tôi cần hỗ trợ thêm thì liên hệ ở đâu?",
    a: "Gọi hotline 1900 1234 hoặc gửi email tới nguyenthanhphat2004.st@gmail.com. Đội ngũ CSKH sẽ hỗ trợ bạn trong giờ làm việc.",
  },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`shrink-0 text-emerald-600 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function CauHoiThuongGapPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main className="bg-[#f9fcfb] min-h-screen">
      <SupportHero
        badge="❓ Câu hỏi thường gặp"
        title="Giải đáp"
        highlight="mọi thắc mắc"
        desc="Tổng hợp những câu hỏi phổ biến về đặt hàng, thanh toán, vận chuyển và dịch vụ tại TP Agri. Nếu chưa tìm thấy câu trả lời, hãy liên hệ với chúng tôi."
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:shadow-md"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-bold text-gray-800 sm:text-base">{f.q}</span>
                  <Chevron open={isOpen} />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-gray-600 sm:px-6">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-100">
          <p className="text-sm text-gray-600">
            Vẫn chưa tìm thấy câu trả lời? Liên hệ{" "}
            <a href="tel:19001234" className="font-bold text-emerald-700 hover:underline">1900 1234</a>{" "}
            hoặc{" "}
            <a href="mailto:nguyenthanhphat2004.st@gmail.com" className="font-bold text-emerald-700 hover:underline">nguyenthanhphat2004.st@gmail.com</a>.
          </p>
          <Link
            href="/huong-dan-mua-hang"
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 px-6 text-sm font-bold text-white shadow transition hover:from-emerald-700 hover:to-green-700"
          >
            Xem hướng dẫn mua hàng →
          </Link>
        </div>
      </div>
    </main>
  );
}
