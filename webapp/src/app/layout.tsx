import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHAREPLZ",
  description: "Secure, real-time text sharing used by developers worldwide. Anonymous, encrypted, and ephemeral.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "SHAREPLZ",
    description: "The fastest way to share code securely. No sign-up required.",
    type: "website",
    siteName: "SHAREPLZ",
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
