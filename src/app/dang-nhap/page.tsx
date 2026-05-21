import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
  title: "Đăng nhập | TP Agri",
  description: "Đăng nhập hoặc đăng ký tài khoản TP Agri",
};

export default function DangNhapPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-gradient-to-br from-[#e8f5ec] via-[#f5fbf7] to-[#e0f0e6] px-4 py-10">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#007e42]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <AuthForm />
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
