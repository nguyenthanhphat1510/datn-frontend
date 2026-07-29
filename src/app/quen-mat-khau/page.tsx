import { Suspense } from "react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Quên mật khẩu | TP Agri",
  description: "Nhận link đặt lại mật khẩu tài khoản TP Agri qua email",
};

export default function QuenMatKhauPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-[#e5e7eb] px-4 py-10">
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <Suspense
          fallback={
            <div className="flex h-80 items-center justify-center rounded-2xl border-2 border-gray-200 bg-white shadow-xl">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#007e42]/20 border-t-[#007e42]" />
            </div>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
