import { notFound } from "next/navigation";
import Link from "next/link";
import DiscoveryExperience from "@/components/DiscoveryExperience";
import EquipmentTaxonomy from "@/components/EquipmentTaxonomy";
import MarketplaceShell from "@/components/MarketplaceShell";
import { findEquipmentFilter } from "@/components/equipmentTaxonomyData";

export default async function EquipmentFilterPage({ params }: { params: Promise<{ slug: string; filter: string }> }) {
  const { slug, filter } = await params;
  const match = findEquipmentFilter(slug, filter);
  if (!match) notFound();
  const groupLabel = match.group === "brand" ? "MARKA" : match.group === "type" ? "ÜRÜN TÜRÜ" : "TEKNİK ÖZELLİK";
  return <MarketplaceShell eyebrow={groupLabel} title={`${match.value} ${match.taxonomy.name}`} description={`${match.taxonomy.name} kategorisinde ${match.value} seçeneğine uygun doğrulanmış ilanları keşfet.`}>
    <nav className="equipmentBreadcrumbV38" aria-label="Kategori yolu"><Link href="/pazarlar">Pazarlar</Link><span>›</span><Link href={`/kategori/${slug}`}>{match.taxonomy.name}</Link><span>›</span><strong>{match.value}</strong></nav>
    <EquipmentTaxonomy category={slug} selected={match.value} />
    <DiscoveryExperience initialQuery={match.value} lockedCategory={match.taxonomy.name} categoryTitle={`${match.value} ${match.taxonomy.name}`} />
  </MarketplaceShell>;
}
