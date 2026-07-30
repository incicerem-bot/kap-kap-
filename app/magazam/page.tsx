import MarketplaceShell from "@/components/MarketplaceShell";
import SellerCenterDashboard from "@/components/SellerCenterDashboard";

export default function SellerCenterPage() {
  return (
    <MarketplaceShell
      eyebrow="SATICI MERKEZİ"
      title="Mağazam"
      description="İlanlarını, mağaza hazırlığını ve satışa başlama adımlarını tek ekrandan yönet."
    >
      <SellerCenterDashboard />
    </MarketplaceShell>
  );
}
