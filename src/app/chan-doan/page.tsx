import ChanDoanPage from "@/components/chan-doan/ChanDoanPage";

export const metadata = {
  title: "Chẩn đoán bệnh lúa qua ảnh (AI) | TP Agri",
  description:
    "Tải ảnh lá lúa để hệ thống AI tự động nhận diện bệnh đạo ôn, bạc lá, đốm nâu... và gợi ý thuốc đặc trị phù hợp.",
};

export default function Page() {
  return <ChanDoanPage />;
}
