import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tin tức Ngành Bán Lẻ",
  description: "Bản tóm tắt tin tức ngành bán lẻ, tự động cập nhật vào sáng thứ Sáu hàng tuần.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-5">
            <a href="/" className="text-xl font-bold tracking-tight">
              Tin tức Ngành Bán Lẻ
            </a>
            <p className="mt-1 text-sm text-slate-500">
              Tóm tắt tự động mỗi tuần (sáng thứ Sáu) từ các nguồn tin trong nước
            </p>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 py-8 text-xs text-slate-400">
          Nội dung được thu thập và tóm tắt tự động bằng AI. Vui lòng đối
          chiếu nguồn gốc trước khi trích dẫn.
        </footer>
      </body>
    </html>
  );
}
