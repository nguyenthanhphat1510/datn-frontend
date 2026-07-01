import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
  title: "Đăng nhập | TP Agri",
  description: "Đăng nhập hoặc đăng ký tài khoản TP Agri",
};

export default function DangNhapPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-[#e5e7eb] px-4 py-10">
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <Suspense
          fallback={
            <div className="flex h-96 items-center justify-center rounded-2xl border-2 border-gray-200 bg-white shadow-xl">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#007e42]/20 border-t-[#007e42]" />
            </div>
          }
        >
          <AuthForm />
        </Suspense>
        <p className="mt-5 text-center text-[11px] text-gray-500">
          Bằng cách tiếp tục, bạn đồng ý với{" "}
          <a href="/dieu-khoan" className="font-semibold text-[#007e42] hover:underline">
            Điều khoản dịch vụ
          </a>{" "}
          và{" "}
          <a href="/bao-mat" className="font-semibold text-[#007e42] hover:underline">
            Chính sách bảo mật
          </a>
          .
        </p>
      </div>
    </div>
  );
}
