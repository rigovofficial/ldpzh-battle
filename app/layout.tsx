import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "ЛДПЖ-Батл",
  description: "Фанатский батл-сайт сообщества Markin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-[#0b0b0f] text-[#f5f5f5]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}