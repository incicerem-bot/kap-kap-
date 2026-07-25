import type { Metadata } from "next";
import { Suspense } from "react";
import MarketplaceShell from "@/components/MarketplaceShell";
import AccountVerificationExperience from "@/components/AccountVerificationExperience";

export const metadata: Metadata = { title: "Hesap Doğrulama — KapışKapış" };

export default function Page() {
  return (
    <MarketplaceShell eyebrow="GÜVENLİK" title="Hesap doğrulama" description="E-posta, telefon ve profil bilgilerini tamamlayarak teklif ve satış işlemlerini etkinleştir." compact>
      <Suspense fallback={<div className="verificationLoadingV20">Hesap doğrulama bilgileri yükleniyor…</div>}>
        <AccountVerificationExperience />
      </Suspense>
    </MarketplaceShell>
  );
}
