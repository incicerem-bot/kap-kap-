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
import "./logistics-v13.css";
import "./legal-v14.css";
import "./reputation-v15.css";
import "./payment-v16.css";
import "./onboarding-v17.css";
import "./bid-security-v18.css";
import "./authz-v19.css";
import "./account-activation-v20.css";
import "./profile-onboarding-v21.css";
import "./admin-accounts-v22.css";
import "./security-v23.css";
import "./dashboard-v24.css";
import "./store-management-v25.css";
import "./seller-center-v26.css";
import "./seller-listings-v27.css";
import "./auction-room-v28.css";
import "./checkout-v29.css";
import "./navigation-v30.css";
import "./navigation-v31.css";
import "./auction-motion-v33.css";
import "./navigation-v34.css";
import "./game-taxonomy-v36.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "KapışKapış — Oyunculara Özel Oyun ve İtem Pazarı",
  description: "Bilgisayar, Xbox, PlayStation ve Steam oyunları; Knight Online, Metin2, CS2 itemleri ve özel seri oyuncu ürünleri.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/kapiskapis-icon.png", apple: "/kapiskapis-icon.png" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#07090c" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body><AuthProvider>{children}</AuthProvider></body></html>;
}
