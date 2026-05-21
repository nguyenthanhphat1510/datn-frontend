import PhanBonPage from "../../components/phan-bon/PhanBonPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phân Bón | TP Agri",
  description:
    "Mua phân bón chất lượng cao: NPK, Ure, DAP, Kali, hữu cơ vi sinh. Giá tốt, giao hàng nhanh.",
};

export default function Page() {
  return <PhanBonPage />;
}
