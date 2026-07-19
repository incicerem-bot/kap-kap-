import MarketplaceShell from "@/components/MarketplaceShell";
import WalletCenterExperience from "@/components/WalletCenterExperience";

export default function WalletPage() {
  return (
    <MarketplaceShell
      eyebrow="FİNANS MERKEZİ"
      title="KapışKapış Cüzdan"
      description="Bakiyeni, güvenli ödemelerini, teklif limitini ve banka hareketlerini tek yerden yönet."
    >
      <WalletCenterExperience />
    </MarketplaceShell>
  );
}
