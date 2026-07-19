import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./design-v3.css";
import "./experience-v5.css";
import "./finance-v6.css";
import "./support-v7.css";
import "./account-v8.css";
import "./seller-v9.css";
import "./discovery-v10.css";
import "./engagement-v11.css";
import "./admin-v12.css";

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
