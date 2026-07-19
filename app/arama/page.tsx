import DiscoveryExperience from "@/components/DiscoveryExperience";
import MarketplaceShell from "@/components/MarketplaceShell";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return <MarketplaceShell compact eyebrow="ARAMA SONUÇLARI" title={q ? `“${q}” için sonuçlar` : "Ürün ara"} description="KapışKapış'taki güncel açık artırmaları keşfet."><DiscoveryExperience initialQuery={q} /></MarketplaceShell>;
}
