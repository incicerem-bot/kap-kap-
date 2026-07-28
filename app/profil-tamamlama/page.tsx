import type { Metadata } from "next";
import { Suspense } from "react";
import MarketplaceShell from "@/components/MarketplaceShell";
import ProfileCompletionExperience from "@/components/ProfileCompletionExperience";

export const metadata: Metadata = { title: "Profilini Tamamla — KapışKapış" };

export default function Page() {
  return (
    <MarketplaceShell eyebrow="HESAP KURULUMU" title="Profilini tamamla" description="Teklif, satış ve güvenli ödeme işlemleri için zorunlu hesap bilgilerini tamamla." compact>
      <Suspense fallback={<div className="profileSetupLoadingV21">Profil bilgileri hazırlanıyor…</div>}>
        <ProfileCompletionExperience />
      </Suspense>
    </MarketplaceShell>
  );
}
