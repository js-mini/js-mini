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
  themeColor: "#D4AF37",
  viewport: "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
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
