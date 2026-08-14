"use client";

import SupportHero from "./SupportHero";
import PolicyContent, { type PolicySection } from "./PolicyContent";

const sections: PolicySection[] = [
  {
    heading: "Thông tin chúng tôi thu thập",
    bullets: [
      "Thông tin cá nhân: họ tên, số điện thoại, email khi bạn đăng ký hoặc đặt hàng.",
      "Địa chỉ nhận hàng phục vụ giao hàng và tính phí vận chuyển.",
      "Thông tin đơn hàng, lịch sử mua sắm và tương tác trên website.",
      "Dữ liệu kỹ thuật cơ bản (loại thiết bị, trình duyệt) để cải thiện trải nghiệm.",
    ],
  },
  {
    heading: "Mục đích sử dụng thông tin",
    bullets: [
      "Xử lý đơn hàng, giao hàng và hỗ trợ chăm sóc khách hàng.",
      "Xác thực tài khoản và bảo mật quá trình đăng nhập.",
      "Gửi thông báo về trạng thái đơn hàng và các thông tin cần thiết.",
      "Cải thiện chất lượng sản phẩm, dịch vụ và trải nghiệm mua sắm.",
    ],
  },
  {
    heading: "Bảo mật thông tin",
    paragraphs: [
      "Mật khẩu của bạn được mã hoá và không được lưu ở dạng văn bản thuần. Chúng tôi áp dụng các biện pháp kỹ thuật hợp lý để bảo vệ dữ liệu khỏi truy cập trái phép. Thông tin thanh toán được xử lý qua cổng thanh toán uy tín (VNPay) — TP Agri không lưu trữ thông tin thẻ của bạn.",
    ],
  },
  {
    heading: "Chia sẻ thông tin",
    paragraphs: [
      "Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn. Thông tin chỉ được chia sẻ với các đối tác vận chuyển và cổng thanh toán ở mức tối thiểu cần thiết để hoàn tất đơn hàng, hoặc khi có yêu cầu hợp pháp từ cơ quan chức năng.",
    ],
  },
  {
    heading: "Quyền của bạn",
    bullets: [
      "Xem, cập nhật hoặc chỉnh sửa thông tin cá nhân trong mục Tài khoản.",
      "Yêu cầu xoá tài khoản và dữ liệu liên quan.",
      "Liên hệ nguyenthanhphat2004.st@gmail.com nếu có thắc mắc về quyền riêng tư.",
    ],
  },
];

export default function ChinhSachBaoMatPage() {
  return (
    <main className="bg-[#f9fcfb] min-h-screen">
      <SupportHero
        badge="🔒 Chính sách bảo mật"
        title="Bảo mật"
        highlight="thông tin của bạn"
        desc="TP Agri tôn trọng và cam kết bảo vệ thông tin cá nhân của bà con. Chính sách dưới đây giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn."
      />
      <PolicyContent sections={sections} updatedAt="05/07/2026" />
    </main>
  );
}
