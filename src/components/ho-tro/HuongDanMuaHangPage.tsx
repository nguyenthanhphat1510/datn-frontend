"use client";

import Link from "next/link";
import SupportHero from "./SupportHero";

const steps = [
  {
    n: 1,
    title: "Tìm & chọn sản phẩm",
    desc: "Duyệt danh mục Phân bón, Thuốc BVTV hoặc dùng thanh tìm kiếm để chọn đúng sản phẩm cho mùa vụ. Bấm vào sản phẩm để xem chi tiết, thành phần và hướng dẫn sử dụng.",
  },
  {
    n: 2,
    title: "Thêm vào giỏ hàng",
    desc: "Chọn số lượng phù hợp rồi bấm “Thêm vào giỏ”. Bạn có thể tiếp tục mua thêm hoặc mở giỏ hàng để kiểm tra lại đơn.",
  },
  {
    n: 3,
    title: "Kiểm tra giỏ & đặt hàng",
    desc: "Mở Giỏ hàng, kiểm tra sản phẩm, số lượng, tổng tiền và điều chỉnh nếu cần. Bấm “Thanh toán” để chuyển sang bước điền thông tin nhận hàng.",
  },
  {
    n: 4,
    title: "Điền thông tin nhận hàng",
    desc: "Nhập họ tên, số điện thoại và địa chỉ giao hàng chính xác. Hệ thống sẽ tính phí vận chuyển theo khoảng cách từ kho TP Agri đến địa chỉ của bạn.",
  },
  {
    n: 5,
    title: "Chọn phương thức thanh toán",
    desc: "Bạn có thể chọn thanh toán khi nhận hàng (COD) hoặc VNPay. Với VNPay, bạn sẽ được chuyển sang cổng thanh toán để hoàn tất.",
  },
  {
    n: 6,
    title: "Theo dõi đơn hàng",
    desc: "Sau khi đặt thành công, vào mục “Đơn hàng của tôi” để theo dõi trạng thái xử lý, đóng gói và giao hàng của đơn.",
  },
];

export default function HuongDanMuaHangPage() {
  return (
    <main className="bg-[#f9fcfb] min-h-screen">
      <SupportHero
        badge="🛒 Hướng dẫn mua hàng"
        title="Mua sắm dễ dàng"
        highlight="chỉ với 6 bước"
        desc="Đặt phân bón, thuốc bảo vệ thực vật chính hãng tại TP Agri nhanh chóng, an toàn. Làm theo các bước dưới đây để hoàn tất đơn hàng."
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <ol className="space-y-6">
          {steps.map((s) => (
            <li
              key={s.n}
              className="flex gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:shadow-md sm:gap-5 sm:p-6"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-lg font-black text-white shadow">
                {s.n}
              </span>
              <div>
                <h3 className="text-base font-bold text-gray-800 sm:text-lg">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-2xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-100">
          <p className="text-sm text-gray-600">
            Cần thêm hỗ trợ? Gọi hotline{" "}
            <a href="tel:19001234" className="font-bold text-emerald-700 hover:underline">1900 1234</a>{" "}
            hoặc email{" "}
            <a href="mailto:nguyenthanhphat2004.st@gmail.com" className="font-bold text-emerald-700 hover:underline">nguyenthanhphat2004.st@gmail.com</a>.
          </p>
          <Link
            href="/phan-bon"
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 px-6 text-sm font-bold text-white shadow transition hover:from-emerald-700 hover:to-green-700"
          >
            Bắt đầu mua sắm →
          </Link>
        </div>
      </div>
    </main>
  );
}
