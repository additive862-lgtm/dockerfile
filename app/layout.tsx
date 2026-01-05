import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import NavWrapper from "./components/NavWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "두돌 - 이석재 신부와 함께하는 영성 여행",
  description: "이석재 토마스 데 아퀴나스 신부와 함께하는 깊이 있는 성경 묵상과 교회사 여행",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-slate-50 text-slate-800`}>
        {/* Navigation */}
        <NavWrapper />

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500">
            <p className="text-sm">© 2026 Dudol. All rights reserved.</p>
            <p className="text-xs mt-2">이석재 신부 (토마스 데 아퀴나스)</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
