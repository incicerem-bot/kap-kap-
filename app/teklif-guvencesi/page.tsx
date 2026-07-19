import MarketplaceShell from "@/components/MarketplaceShell";
import BidSecurityCenterExperience from "@/components/BidSecurityCenterExperience";

export default async function SmartBidSecurityPage({ searchParams }: { searchParams: Promise<{ listing?: string; bid?: string; max?: string; return?: string }> }) {
  const params = await searchParams;
  const bid = Number(params.bid ?? 0);
  const max = params.max ? Number(params.max) : null;
  return (
    <MarketplaceShell
      eyebrow="AKILLI TEKLİF GÜVENCESİ"
      title="Yalnızca gereken kadar güvence"
      description="Önceden limit yükleme yok. Teklifin için gereken güvence sistem tarafından otomatik hesaplanır."
    >
      <BidSecurityCenterExperience listingSlug={params.listing} bidAmount={Number.isFinite(bid) ? bid : 0} maxAmount={Number.isFinite(max ?? NaN) ? max : null} returnPath={params.return} />
    </MarketplaceShell>
  );
}
