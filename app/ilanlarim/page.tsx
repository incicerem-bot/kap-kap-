import MarketplaceShell from "@/components/MarketplaceShell";
import SellerCenterExperience from "@/components/SellerCenterExperience";

export default function SellerCenterPage() {
  return (
    <MarketplaceShell
      eyebrow="SATIŞ YÖNETİMİ"
      title="Satış Merkezi"
      description="İlanlarını, siparişlerini, kazancını ve satıcı performansını tek yerden yönet."
      compact
    >
      <SellerCenterExperience />
    </MarketplaceShell>
  );
}
