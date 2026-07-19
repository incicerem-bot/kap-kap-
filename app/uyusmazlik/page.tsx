import MarketplaceShell from "@/components/MarketplaceShell";
import TrustCenterExperience from "@/components/TrustCenterExperience";

export default function Page() {
  return (
    <MarketplaceShell
      eyebrow="ALICI KORUMASI"
      title="Uyuşmazlık Merkezi"
      description="İade, iptal ve teslimat sorunlarını güvenli ödeme koruması altında takip et."
    >
      <TrustCenterExperience initialView="disputes" />
    </MarketplaceShell>
  );
}
