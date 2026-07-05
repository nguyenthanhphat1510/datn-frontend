"use client";

import SupportHero from "./SupportHero";
import PolicyContent, { type PolicySection } from "./PolicyContent";

const sections: PolicySection[] = [
  {
    heading: "Phạm vi áp dụng",
    paragraphs: [
      "Chính sách đổi trả áp dụng cho các sản phẩm phân bón và thuốc bảo vệ thực vật được mua trực tiếp tại TP Agri. Chúng tôi cam kết đồng hành cùng bà con để đảm bảo sản phẩm đến tay luôn chính hãng và đúng chất lượng.",
    ],
  },
  {
    heading: "Điều kiện được đổi / trả hàng",
    bullets: [
      "Sản phẩm còn nguyên tem, nhãn, bao bì, chưa qua sử dụng và còn hạn sử dụng.",
      "Sản phẩm bị lỗi do nhà sản xuất: rách bao, chảy nước, sai thông tin trên nhãn.",
      "Giao sai sản phẩm, sai số lượng, sai quy cách so với đơn đặt hàng.",
      "Có hoá đơn / mã đơn hàng và yêu cầu được gửi trong thời hạn quy định.",
    ],
  },
  {
    heading: "Thời hạn đổi trả",
    paragraphs: [
      "Bà con vui lòng phản hồi trong vòng 48 giờ kể từ khi nhận hàng đối với sản phẩm bị lỗi hoặc giao sai. Với sản phẩm còn nguyên vẹn chưa sử dụng, thời hạn yêu cầu đổi là 7 ngày kể từ ngày nhận.",
    ],
  },
  {
    heading: "Trường hợp không áp dụng đổi trả",
    bullets: [
      "Sản phẩm đã mở bao bì, đã sử dụng một phần (trừ khi lỗi từ nhà sản xuất).",
      "Sản phẩm hư hỏng do bảo quản sai cách sau khi nhận hàng.",
      "Quá thời hạn yêu cầu đổi trả nêu trên.",
    ],
  },
  {
    heading: "Quy trình đổi trả",
    bullets: [
      "Liên hệ hotline 1900 1234 hoặc email nguyenthanhphat2004.st@gmail.com kèm mã đơn hàng và hình ảnh sản phẩm.",
      "Bộ phận CSKH xác nhận yêu cầu trong vòng 24 giờ làm việc.",
      "TP Agri hỗ trợ đổi sản phẩm mới hoặc hoàn tiền theo phương thức thanh toán ban đầu.",
    ],
  },
];

export default function ChinhSachDoiTraPage() {
  return (
    <main className="bg-[#f9fcfb] min-h-screen">
      <SupportHero
        badge="🔄 Chính sách đổi trả"
        title="Đổi trả"
        highlight="minh bạch & yên tâm"
        desc="TP Agri cam kết bảo vệ quyền lợi của bà con với chính sách đổi trả rõ ràng đối với các sản phẩm phân bón và thuốc bảo vệ thực vật."
      />
      <PolicyContent sections={sections} updatedAt="05/07/2026" />
    </main>
  );
}
