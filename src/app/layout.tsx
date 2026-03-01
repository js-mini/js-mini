import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jewelshot® — AI Jewelry Photography",
  description:
    "Mücevher fotoğraflarınızı yapay zeka ile profesyonel e-ticaret görsellerine dönüştürün.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jewelshot®",
  },
};

export const viewport = {
  themeColor: "#D4AF37",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

import { InstallPrompt } from "@/components/layout/install-prompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.className} dark`} suppressHydrationWarning>
      <body>
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
