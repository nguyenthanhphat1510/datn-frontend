import type { Metadata } from "next";
import TimKiemPage from "@/components/tim-kiem/TimKiemPage";

export const metadata: Metadata = {
  title: "Tìm kiếm | TP Agri",
  description: "Tìm kiếm sản phẩm phân bón, thuốc bảo vệ thực vật tại TP Agri.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  return <TimKiemPage initialQuery={q} />;
}
