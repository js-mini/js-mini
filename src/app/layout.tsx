import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JewelShot — AI Jewelry Photography",
  description:
    "Mücevher fotoğraflarınızı yapay zeka ile profesyonel e-ticaret görsellerine dönüştürün.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.className} dark`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
