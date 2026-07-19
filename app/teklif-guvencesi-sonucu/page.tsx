import MarketplaceShell from "@/components/MarketplaceShell";
import BidSecurityResultExperience from "@/components/BidSecurityResultExperience";

export default async function SmartBidSecurityResultPage({ searchParams }: { searchParams: Promise<{ status?: string; message?: string }> }) {
  const params = await searchParams;
  return (
    <MarketplaceShell compact title="Akıllı teklif güvencesi sonucu">
      <BidSecurityResultExperience initialStatus={params.status ?? "processing"} initialMessage={params.message ?? ""} />
    </MarketplaceShell>
  );
}
