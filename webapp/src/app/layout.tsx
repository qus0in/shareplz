import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

// 배포 환경의 base URL 설정
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://shareplz.qus0in.dev";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "SHAREPLZ",
  description: "실시간 텍스트 공유",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "SHAREPLZ",
    description: "실시간 텍스트 공유",
    type: "website",
    siteName: "SHAREPLZ",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "SHAREPLZ - 실시간 텍스트 공유",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="antialiased">
        {children}
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}
