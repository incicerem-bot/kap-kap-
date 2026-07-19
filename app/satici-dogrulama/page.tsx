import MarketplaceShell from "@/components/MarketplaceShell";
import SellerOnboardingExperience from "@/components/SellerOnboardingExperience";

export default function SellerVerificationPage() {
  return (
    <MarketplaceShell
      eyebrow="GÜVENLİ SATICI ÖDEMELERİ"
      title="Satıcı Doğrulama"
      description="Satış gelirlerini alabilmek için iyzico alt üye hesabını güvenli şekilde oluştur."
      compact
    >
      <SellerOnboardingExperience />
    </MarketplaceShell>
  );
}
