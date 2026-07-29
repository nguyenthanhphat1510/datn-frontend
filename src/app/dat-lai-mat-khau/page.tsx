import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Đặt lại mật khẩu | TP Agri",
  description: "Tạo mật khẩu mới cho tài khoản TP Agri",
};

export default function DatLaiMatKhauPage() {
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
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
