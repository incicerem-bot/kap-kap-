import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KapışKapış — Açık Artırma Platformu",
  description: "Beğendiysen bekleme, KapışKapış kap!",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/kapiskapis-icon.png",
    apple: "/kapiskapis-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07090c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
